/**
 * IQRA AOE — Academy of Excellence
 * Google Apps Script backend. Google Sheets is the database.
 *
 * Sheet tabs (exact names):
 *   Users: UserID | Password | StudentName | Class | ExpiryDate | TotalXP | CurrentStreak
 *   Admin: AdminID | AdminPass
 *
 * Link the spreadsheet in either way:
 *   1. Container-bound (recommended): Extensions → Apps Script from the sheet.
 *   2. Standalone: Project Settings → Script properties → SPREADSHEET_ID = the sheet id.
 *
 * Students and admins talk to this file only through api().
 * Helpers live inside api() so they are not callable from the browser.
 */

var TZ = 'Asia/Kolkata';
var USERS_SHEET = 'Users';
var ADMIN_SHEET = 'Admin';
var USER_HEADERS = ['UserID', 'Password', 'StudentName', 'Class', 'ExpiryDate', 'TotalXP', 'CurrentStreak'];
var ADMIN_HEADERS = ['AdminID', 'AdminPass'];
var SESSION_SECONDS = 21600;

function doGet() {
  try {
    return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('IQRA AOE — Academy of Excellence')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    return HtmlService.createHtmlOutput(
      '<h1 style="font-family:sans-serif">IQRA AOE could not start</h1><p>' +
      String(err && err.message ? err.message : err) +
      '</p><p>In the Apps Script editor, run initializeSheets, then deploy a new web app version.</p>'
    );
  }
}

function doPost() {
  return doGet();
}

function include(filename) {
  var allowed = { CSS: true, JS: true, Team: true };
  if (!allowed[filename]) return '';
  // getRawContent copies the file unchanged. getContent() runs it through the
  // template compiler and turns valid CSS/JS into "Unexpected token ';'" errors.
  return HtmlService.createTemplateFromFile(filename).getRawContent();
}

function onOpen() {
  assertEditor_();
  SpreadsheetApp.getUi()
    .createMenu('IQRA AOE')
    .addItem('Initialize sheets', 'initializeSheets')
    .addItem('Seed sample accounts', 'seedSampleData')
    .addToUi();
}

function initializeSheets() {
  assertEditor_();
  var ss = openDatabase_();
  ensureSheet_(ss, USERS_SHEET, USER_HEADERS);
  ensureSheet_(ss, ADMIN_SHEET, ADMIN_HEADERS);
  return 'Users and Admin sheets are ready.';
}

function seedSampleData() {
  assertEditor_();
  initializeSheets();
  var ss = openDatabase_();
  var admin = ss.getSheetByName(ADMIN_SHEET);
  if (admin.getLastRow() < 2) {
    admin.appendRow(['admin', 'ChangeMe123']);
  }
  var users = ss.getSheetByName(USERS_SHEET);
  if (users.getLastRow() < 2) {
    var nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    users.appendRow(['STD001', 'pass123', 'Ayesha Khan', 5, atNoon_(nextYear), 120, 3]);
    users.appendRow(['STD002', 'pass123', 'Rahul Patil', 8, atNoon_(yesterday), 40, 1]);
  }
  return 'Sample rows added only where a sheet had no accounts. Change the passwords in the sheet before sharing the web app URL.';
}

/**
 * Single browser entry point.
 * action: login | logout | session | listStudents | addStudent | updateStudent | deleteStudent | updateXP
 */
function api(action, payload) {
  try {
    payload = payload && typeof payload === 'object' ? payload : {};
    switch (String(action || '')) {
      case 'login':
        return login_(payload);
      case 'logout':
        return logout_(payload);
      case 'session':
        return session_(payload);
      case 'listStudents':
        return listStudents_(payload);
      case 'addStudent':
        return addStudent_(payload);
      case 'updateStudent':
        return updateStudent_(payload);
      case 'deleteStudent':
        return deleteStudent_(payload);
      case 'updateXP':
        return updateXP_(payload);
      default:
        return fail_('Unknown request.');
    }
  } catch (err) {
    return fail_(err && err.message ? err.message : 'Something went wrong. Please try again.');
  }

  function login_(body) {
    var userId = cleanId_(body.userId);
    var password = String(body.password == null ? '' : body.password);
    if (!userId || !password) return fail_('Enter your ID and password.');
    assertRateLimit_(userId);

    var adminHit = findAdmin_(userId);
    if (adminHit && String(adminHit.password) === password) {
      clearRateLimit_(userId);
      return {
        ok: true,
        role: 'admin',
        token: issueToken_('admin', userId),
        profile: { displayName: 'Administrator', userId: userId }
      };
    }

    var student = findStudent_(userId);
    if (!student || String(student.password) !== password) {
      return fail_('Invalid ID or password.');
    }
    clearRateLimit_(userId);
    if (!student.expiry) return fail_('Account Expired. Please contact Admin.');
    if (isExpired_(student.expiry)) return fail_('Account Expired. Please contact Admin.');

    return {
      ok: true,
      role: 'student',
      token: issueToken_('student', student.userId),
      profile: publicStudent_(student)
    };
  }

  function logout_(body) {
    var token = String(body.token || '');
    if (token) CacheService.getScriptCache().remove(sessionKey_(token));
    return { ok: true };
  }

  function session_(body) {
    var session = readSession_(body.token);
    if (!session) return fail_('Your session has ended. Please sign in again.');
    if (session.role === 'admin') {
      return { ok: true, role: 'admin', token: body.token, profile: { displayName: 'Administrator', userId: session.id } };
    }
    var student = findStudent_(session.id);
    if (!student || !student.expiry || isExpired_(student.expiry)) {
      CacheService.getScriptCache().remove(sessionKey_(body.token));
      return fail_('Account Expired. Please contact Admin.');
    }
    return { ok: true, role: 'student', token: body.token, profile: publicStudent_(student) };
  }

  function listStudents_(body) {
    requireRole_(body.token, 'admin');
    return { ok: true, students: allStudents_().map(publicStudent_) };
  }

  function addStudent_(body) {
    requireRole_(body.token, 'admin');
    var draft = validateStudent_(body.student, true);
    if (findStudent_(draft.userId)) return fail_('That User ID already exists.');
    withLock_(function () {
      if (findStudent_(draft.userId)) throw new Error('That User ID already exists.');
      sheet_(USERS_SHEET).appendRow([
        draft.userId,
        draft.password,
        draft.studentName,
        draft.classLevel,
        draft.expiry,
        0,
        0
      ]);
    });
    return { ok: true, students: allStudents_().map(publicStudent_) };
  }

  function updateStudent_(body) {
    requireRole_(body.token, 'admin');
    var draft = validateStudent_(body.student, false);
    withLock_(function () {
      var existing = findStudent_(draft.userId);
      if (!existing) throw new Error('Student not found.');
      var password = draft.password ? draft.password : existing.password;
      writeStudentRow_(existing.row, [
        existing.userId,
        password,
        draft.studentName,
        draft.classLevel,
        draft.expiry,
        existing.totalXP,
        existing.currentStreak
      ]);
    });
    return { ok: true, students: allStudents_().map(publicStudent_) };
  }

  function deleteStudent_(body) {
    requireRole_(body.token, 'admin');
    var userId = cleanId_(body.userId);
    if (!userId) return fail_('Student not found.');
    withLock_(function () {
      var existing = findStudent_(userId);
      if (!existing) throw new Error('Student not found.');
      sheet_(USERS_SHEET).deleteRow(existing.row);
    });
    return { ok: true, students: allStudents_().map(publicStudent_) };
  }

  function updateXP_(body) {
    var session = requireRole_(body.token, 'student');
    var gained = Math.round(Number(body.xp) || 0);
    if (gained < 0) gained = 0;
    if (gained > 500) gained = 500;
    var nonce = String(body.nonce || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
    var duplicate = false;
    var student = withLock_(function () {
      var current = findStudent_(session.id);
      if (!current) throw new Error('Student record not found.');
      if (!current.expiry || isExpired_(current.expiry)) throw new Error('Account Expired. Please contact Admin.');
      if (nonce) {
        var cache = CacheService.getScriptCache();
        var nonceKey = 'xp_' + session.id + '_' + nonce;
        if (cache.get(nonceKey)) {
          duplicate = true;
          return current;
        }
        cache.put(nonceKey, '1', SESSION_SECONDS);
      }
      var total = current.totalXP + gained;
      writeStudentRow_(current.row, [
        current.userId,
        current.password,
        current.studentName,
        current.classLevel,
        current.expiry,
        total,
        current.currentStreak
      ]);
      current.totalXP = total;
      return current;
    });
    return { ok: true, profile: publicStudent_(student), added: duplicate ? 0 : gained };
  }

  function validateStudent_(input, creating) {
    input = input || {};
    var userId = cleanId_(input.userId);
    var studentName = String(input.studentName || '').trim().replace(/\s+/g, ' ');
    var classLevel = normalizeClass_(input.classLevel);
    var expiry = parseDate_(input.expiryDate);
    var password = String(input.password == null ? '' : input.password);
    if (!userId || userId.length < 3 || userId.length > 32) {
      throw new Error('User ID must be 3 to 32 letters or numbers.');
    }
    if (!/^[A-Za-z0-9_-]+$/.test(userId)) throw new Error('User ID may use letters, numbers, _ and - only.');
    if (studentName.length < 2 || studentName.length > 60) throw new Error('Enter the student name.');
    if (!classLevel) throw new Error('Choose a class from 1 to 10.');
    if (!expiry) throw new Error('Set a valid expiry date.');
    if (creating && password.length < 4) throw new Error('Password must be at least 4 characters.');
    if (!creating && password && password.length < 4) throw new Error('Password must be at least 4 characters.');
    if (password.length > 64) throw new Error('Password is too long.');
    return {
      userId: userId,
      studentName: safeText_(studentName),
      classLevel: classLevel,
      expiry: expiry,
      password: safeText_(password)
    };
  }

  function sheet_(name) {
    var ss = openDatabase_();
    var tab = ss.getSheetByName(name);
    if (!tab) throw new Error('Missing "' + name + '" sheet. In the editor, run initializeSheets.');
    return tab;
  }

  function table_(name) {
    var tab = sheet_(name);
    var lastRow = tab.getLastRow();
    var lastCol = tab.getLastColumn();
    if (lastRow < 1 || lastCol < 1) return [];
    var values = tab.getRange(1, 1, lastRow, lastCol).getValues();
    var headers = values[0].map(function (cell) { return String(cell).trim(); });
    var records = [];
    for (var r = 1; r < values.length; r++) {
      var record = { _row: r + 1 };
      var blank = true;
      for (var c = 0; c < headers.length; c++) {
        record[headers[c]] = values[r][c];
        if (String(values[r][c] == null ? '' : values[r][c]).trim() !== '') blank = false;
      }
      if (!blank) records.push(record);
    }
    return records;
  }

  function findAdmin_(userId) {
    var wanted = userId.toLowerCase();
    var rows = table_(ADMIN_SHEET);
    for (var i = 0; i < rows.length; i++) {
      var id = String(rows[i].AdminID == null ? '' : rows[i].AdminID).trim();
      if (id.toLowerCase() === wanted) {
        return { userId: id, password: String(rows[i].AdminPass == null ? '' : rows[i].AdminPass).trim() };
      }
    }
    return null;
  }

  function findStudent_(userId) {
    var wanted = String(userId || '').trim().toLowerCase();
    var rows = allStudents_();
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].userId.toLowerCase() === wanted) return rows[i];
    }
    return null;
  }

  function allStudents_() {
    return table_(USERS_SHEET).map(function (row) {
      return {
        row: row._row,
        userId: String(row.UserID == null ? '' : row.UserID).trim(),
        password: String(row.Password == null ? '' : row.Password).trim(),
        studentName: String(row.StudentName == null ? '' : row.StudentName).trim(),
        classLevel: normalizeClass_(row.Class) || 0,
        expiry: parseDate_(row.ExpiryDate),
        totalXP: Math.max(0, Math.round(Number(row.TotalXP) || 0)),
        currentStreak: Math.max(0, Math.round(Number(row.CurrentStreak) || 0))
      };
    }).filter(function (student) { return student.userId; });
  }

  function publicStudent_(student) {
    return {
      userId: student.userId,
      studentName: student.studentName,
      classLevel: student.classLevel,
      expiryDate: student.expiry ? Utilities.formatDate(student.expiry, TZ, 'yyyy-MM-dd') : '',
      totalXP: student.totalXP,
      currentStreak: student.currentStreak,
      expired: !student.expiry || isExpired_(student.expiry)
    };
  }

  function writeStudentRow_(rowNumber, cells) {
    var safe = cells.map(function (value) {
      if (value instanceof Date) return value;
      return safeText_(value);
    });
    sheet_(USERS_SHEET).getRange(rowNumber, 1, 1, USER_HEADERS.length).setValues([safe]);
  }

  function requireRole_(token, role) {
    var session = readSession_(token);
    if (!session || session.role !== role) {
      throw new Error('Your session has ended. Please sign in again.');
    }
    return session;
  }

  function issueToken_(role, id) {
    var token = Utilities.getUuid();
    CacheService.getScriptCache().put(sessionKey_(token), JSON.stringify({
      role: role,
      id: id,
      issued: Date.now()
    }), SESSION_SECONDS);
    return token;
  }

  function readSession_(token) {
    token = String(token || '');
    if (!token) return null;
    var raw = CacheService.getScriptCache().get(sessionKey_(token));
    if (!raw) return null;
    try {
      var session = JSON.parse(raw);
      if (!session || !session.role || !session.id) return null;
      return session;
    } catch (err) {
      return null;
    }
  }

  function assertRateLimit_(userId) {
    var cache = CacheService.getScriptCache();
    var key = 'rl_' + userId.toLowerCase();
    var attempts = Number(cache.get(key) || 0);
    if (attempts >= 8) throw new Error('Too many attempts. Please wait a few minutes.');
    cache.put(key, String(attempts + 1), 600);
  }

  function clearRateLimit_(userId) {
    CacheService.getScriptCache().remove('rl_' + userId.toLowerCase());
  }

  function withLock_(fn) {
    var lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      return fn();
    } finally {
      lock.releaseLock();
    }
  }

  function fail_(message) {
    return { ok: false, error: message };
  }
}

function assertEditor_() {
  var email = '';
  try {
    email = Session.getActiveUser().getEmail() || '';
  } catch (err) {
    email = '';
  }
  if (!email) {
    throw new Error('Run this from the Apps Script editor while you are signed in. It cannot be called from the web app.');
  }
}

function openDatabase_() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (id) return SpreadsheetApp.openById(String(id).trim());
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  throw new Error('No spreadsheet is linked. Bind the script to the sheet, or set Script property SPREADSHEET_ID.');
}

function ensureSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  var width = Math.max(sheet.getLastColumn(), headers.length);
  var current = width ? sheet.getRange(1, 1, 1, width).getValues()[0].map(function (cell) { return String(cell).trim(); }) : [];
  var missing = headers.some(function (header, index) { return current[index] !== header; });
  if (sheet.getLastRow() === 0 || missing && sheet.getLastRow() <= 1) {
    sheet.clear();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  } else if (missing) {
    throw new Error('The "' + name + '" sheet headers must be: ' + headers.join(', '));
  }
  sheet.setFrozenRows(1);
  return sheet;
}

function sessionKey_(token) {
  return 'sess_' + token;
}

function cleanId_(value) {
  return String(value == null ? '' : value).trim();
}

function safeText_(value) {
  var text = String(value == null ? '' : value);
  if (/^[=+\-@]/.test(text)) return "'" + text;
  return text;
}

function normalizeClass_(value) {
  var match = String(value == null ? '' : value).match(/\d+/);
  if (!match) return null;
  var level = parseInt(match[0], 10);
  if (level < 1 || level > 10) return null;
  return level;
}

function parseDate_(value) {
  if (value instanceof Date && !isNaN(value.getTime())) return atNoon_(value);
  var text = String(value == null ? '' : value).trim();
  if (!text) return null;
  var iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return dateParts_(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  var local = text.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
  if (local) return dateParts_(Number(local[3]), Number(local[2]), Number(local[1]));
  var parsed = new Date(text);
  if (isNaN(parsed.getTime())) return null;
  return atNoon_(parsed);
}

function dateParts_(year, month, day) {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  var date = new Date(year, month - 1, day, 12, 0, 0, 0);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

function atNoon_(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
}

function isExpired_(expiry) {
  var today = atNoon_(new Date());
  return today.getTime() > atNoon_(expiry).getTime();
}
