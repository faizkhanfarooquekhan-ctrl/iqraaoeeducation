/**
 * IQRA AOE — Academy of Excellence
 * Google Apps Script backend. Google Sheets is the database.
 *
 * Tabs:
 *   Users → UserID, Password, StudentName, Class, ExpiryDate, TotalXP, CurrentStreak
 *   Admin → AdminID, AdminPass
 *
 * Link the sheet by either:
 *   1. Binding this script to the spreadsheet (Extensions → Apps Script), or
 *   2. Pasting the spreadsheet ID into SPREADSHEET_ID below, or
 *   3. Running setSpreadsheetId('the-id') once from the editor.
 */

var SPREADSHEET_ID = '1YywsSUGKckzORomiB4AUsnZh4HFVLKnmZTXzVK3v6b8';

var USER_SHEET = 'Users';
var ADMIN_SHEET = 'Admin';
var USER_HEADERS = ['UserID', 'Password', 'StudentName', 'Class', 'ExpiryDate', 'TotalXP', 'CurrentStreak'];
var ADMIN_HEADERS = ['AdminID', 'AdminPass'];
var SESSION_SECONDS = 21600;
var MAX_XP_PER_TEST = 500;

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('IQRA AOE — Academy of Excellence')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/** Run once from the Apps Script editor after the sheet exists. */
function setSpreadsheetId(id) {
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', String(id || '').trim());
  return 'Spreadsheet linked.';
}

/**
 * Creates both tabs, header rows, and seed accounts when those tabs are empty.
 * Seed admin: admin / Excellence@2026
 * Seed student: IQRA001 / Learn@2026 (Class 6, valid until 31 Mar 2027)
 * Change these passwords in the sheet before sharing the web app.
 */
function setupAcademySheets() {
  var ss = openSpreadsheet_();
  var users = ensureSheet_(ss, USER_SHEET, USER_HEADERS);
  var admins = ensureSheet_(ss, ADMIN_SHEET, ADMIN_HEADERS);

  if (admins.getLastRow() < 2) {
    admins.appendRow(['admin', 'Excellence@2026']);
  }
  if (users.getLastRow() < 2) {
    users.appendRow(['IQRA001', 'Learn@2026', 'Ayesha Khan', 6, '2027-03-31', 120, 3]);
    users.appendRow(['IQRA002', 'Learn@2026', 'Arhaan Shaikh', 3, '2027-03-31', 40, 1]);
    users.appendRow(['IQRA010', 'Learn@2026', 'Zoya Ansari', 10, '2027-03-31', 80, 2]);
  }

  styleHeader_(users, USER_HEADERS.length);
  styleHeader_(admins, ADMIN_HEADERS.length);
  users.setFrozenRows(1);
  admins.setFrozenRows(1);
  users.getRange('E:E').setNumberFormat('yyyy-mm-dd');
  return 'IQRA sheets are ready.';
}

function login(userId, password) {
  try {
    userId = String(userId || '').trim();
    password = String(password == null ? '' : password);
    if (!userId || !password) {
      return { ok: false, error: 'Enter your ID and password.' };
    }

    var ss = openSpreadsheet_();
    var adminHit = findAdmin_(ss, userId, password);
    if (adminHit) {
      return {
        ok: true,
        role: 'admin',
        token: issueToken_('admin', userId),
        admin: { adminId: userId }
      };
    }

    var studentHit = findStudentRow_(ss, userId);
    if (!studentHit || studentHit.password !== password) {
      return { ok: false, error: 'Invalid Login ID or Password.' };
    }

    if (!studentHit.expiryDate) {
      return { ok: false, error: 'Account Expired. Please contact Admin.' };
    }
    if (todayYmd_() > studentHit.expiryDate) {
      return { ok: false, error: 'Account Expired. Please contact Admin.' };
    }

    return {
      ok: true,
      role: 'student',
      token: issueToken_('student', studentHit.userId),
      student: publicStudent_(studentHit)
    };
  } catch (err) {
    return { ok: false, error: err.message || 'Unable to sign in right now.' };
  }
}

function listStudents(token) {
  try {
    requireRole_(token, 'admin');
    var ss = openSpreadsheet_();
    var packed = readUsers_(ss);
    var today = todayYmd_();
    var students = packed.rows.map(function (row) {
      var student = publicStudent_(row);
      student.expired = !row.expiryDate || today > row.expiryDate;
      return student;
    });
    return { ok: true, students: students };
  } catch (err) {
    return { ok: false, error: err.message || 'Could not load students.' };
  }
}

/**
 * Creates or updates a student.
 * mode: "create" | "update"
 * On update, a blank password keeps the current password.
 */
function saveStudent(token, payload, mode) {
  try {
    requireRole_(token, 'admin');
    payload = payload || {};
    var userId = String(payload.userId || '').trim();
    var password = String(payload.password == null ? '' : payload.password);
    var studentName = String(payload.studentName || '').trim();
    var classLevel = parseInt(payload.classLevel, 10);
    var expiryDate = normalizeYmd_(payload.expiryDate);

    if (!userId || !studentName) {
      return { ok: false, error: 'User ID and student name are required.' };
    }
    if (!/^[A-Za-z0-9._@-]{3,40}$/.test(userId)) {
      return { ok: false, error: 'User ID must be 3–40 letters, numbers, or . _ @ -' };
    }
    if (!(classLevel >= 1 && classLevel <= 10)) {
      return { ok: false, error: 'Class must be between 1 and 10.' };
    }
    if (!expiryDate) {
      return { ok: false, error: 'Set a valid expiry date.' };
    }

    return withLock_(function () {
      var ss = openSpreadsheet_();
      var packed = readUsers_(ss);
      var existingIndex = -1;
      packed.rows.forEach(function (row, index) {
        if (row.userId.toLowerCase() === userId.toLowerCase()) existingIndex = index;
      });

      if (mode === 'update') {
        if (existingIndex < 0) return { ok: false, error: 'Student not found.' };
        if (!password) password = packed.rows[existingIndex].password;
      } else {
        if (existingIndex >= 0) return { ok: false, error: 'That User ID already exists.' };
        if (!password || password.length < 4) {
          return { ok: false, error: 'Set a password of at least 4 characters.' };
        }
      }

      if (password.length < 4) {
        return { ok: false, error: 'Password must be at least 4 characters.' };
      }

      var record = {
        userId: userId,
        password: password,
        studentName: studentName,
        classLevel: classLevel,
        expiryDate: expiryDate,
        totalXP: mode === 'update' ? packed.rows[existingIndex].totalXP : 0,
        currentStreak: mode === 'update' ? packed.rows[existingIndex].currentStreak : 0
      };

      if (mode === 'update') {
        writeUserRow_(packed.sheet, packed.map, packed.rows[existingIndex].rowNumber, record);
      } else {
        var rowNumber = Math.max(packed.sheet.getLastRow(), 1) + 1;
        writeUserRow_(packed.sheet, packed.map, rowNumber, record);
      }
      return { ok: true };
    });
  } catch (err) {
    return { ok: false, error: err.message || 'Could not save the student.' };
  }
}

/** Adds XP earned in one math test and advances the streak by one day. */
function recordTestResult(token, xpEarned) {
  try {
    var session = requireRole_(token, 'student');
    xpEarned = Math.round(Number(xpEarned));
    if (!isFinite(xpEarned) || xpEarned < 0 || xpEarned > MAX_XP_PER_TEST) {
      return { ok: false, error: 'XP amount was not accepted.' };
    }

    return withLock_(function () {
      var ss = openSpreadsheet_();
      var packed = readUsers_(ss);
      var row = null;
      packed.rows.forEach(function (item) {
        if (item.userId === session.id) row = item;
      });
      if (!row) return { ok: false, error: 'Student record was not found.' };

      if (!row.expiryDate || todayYmd_() > row.expiryDate) {
        return { ok: false, error: 'Account Expired. Please contact Admin.' };
      }

      row.totalXP = Math.max(0, row.totalXP + xpEarned);
      row.currentStreak = Math.max(0, row.currentStreak + 1);
      writeUserRow_(packed.sheet, packed.map, row.rowNumber, row);
      return { ok: true, student: publicStudent_(row) };
    });
  } catch (err) {
    return { ok: false, error: err.message || 'Could not update XP.' };
  }
}

function openSpreadsheet_() {
  var id = String(SPREADSHEET_ID || '').trim();
  if (!id) {
    id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '';
  }
  if (id) return SpreadsheetApp.openById(id);
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  throw new Error('No spreadsheet is linked. Set SPREADSHEET_ID or bind this script to the Google Sheet.');
}

function ensureSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  return sheet;
}

function styleHeader_(sheet, width) {
  var range = sheet.getRange(1, 1, 1, width);
  range.setFontWeight('bold');
  range.setBackground('#1e1b4b');
  range.setFontColor('#f8fafc');
}

function readUsers_(ss) {
  var sheet = ss.getSheetByName(USER_SHEET);
  if (!sheet) throw new Error('Missing "Users" sheet.');
  var map = headerIndex_(sheet, USER_HEADERS);
  var last = sheet.getLastRow();
  if (last < 2) return { sheet: sheet, map: map, rows: [] };
  var values = sheet.getRange(2, 1, last - 1, sheet.getLastColumn()).getValues();
  var rows = [];
  values.forEach(function (raw, index) {
    var userId = String(cell_(raw, map, 'UserID')).trim();
    if (!userId) return;
    rows.push({
      rowNumber: index + 2,
      userId: userId,
      password: String(cell_(raw, map, 'Password')),
      studentName: String(cell_(raw, map, 'StudentName')).trim(),
      classLevel: parseInt(cell_(raw, map, 'Class'), 10) || 0,
      expiryDate: normalizeYmd_(cell_(raw, map, 'ExpiryDate')),
      totalXP: Number(cell_(raw, map, 'TotalXP')) || 0,
      currentStreak: Number(cell_(raw, map, 'CurrentStreak')) || 0
    });
  });
  return { sheet: sheet, map: map, rows: rows };
}

function findStudentRow_(ss, userId) {
  var packed = readUsers_(ss);
  var found = null;
  packed.rows.forEach(function (row) {
    if (row.userId.toLowerCase() === String(userId).toLowerCase()) found = row;
  });
  return found;
}

function findAdmin_(ss, userId, password) {
  var sheet = ss.getSheetByName(ADMIN_SHEET);
  if (!sheet) throw new Error('Missing "Admin" sheet.');
  var map = headerIndex_(sheet, ADMIN_HEADERS);
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var values = sheet.getRange(2, 1, last - 1, sheet.getLastColumn()).getValues();
  for (var i = 0; i < values.length; i++) {
    var id = String(cell_(values[i], map, 'AdminID')).trim();
    var pass = String(cell_(values[i], map, 'AdminPass'));
    if (id.toLowerCase() === userId.toLowerCase() && pass === password) return true;
  }
  return false;
}

function writeUserRow_(sheet, map, rowNumber, record) {
  var width = sheet.getLastColumn();
  var existing = sheet.getRange(rowNumber, 1, 1, width).getValues()[0];
  if (sheet.getLastRow() < rowNumber) {
    existing = new Array(width).fill('');
  }
  existing[map.UserID] = textCell_(record.userId);
  existing[map.Password] = textCell_(record.password);
  existing[map.StudentName] = textCell_(record.studentName);
  existing[map.Class] = record.classLevel;
  existing[map.ExpiryDate] = record.expiryDate;
  existing[map.TotalXP] = record.totalXP;
  existing[map.CurrentStreak] = record.currentStreak;
  sheet.getRange(rowNumber, 1, 1, width).setValues([existing]);
}

function headerIndex_(sheet, required) {
  var width = Math.max(sheet.getLastColumn(), required.length);
  var headers = sheet.getRange(1, 1, 1, width).getValues()[0].map(function (value) {
    return String(value || '').trim();
  });
  var map = {};
  headers.forEach(function (header, index) {
    if (header) map[header] = index;
  });
  required.forEach(function (header) {
    if (map[header] === undefined) {
      throw new Error('Sheet "' + sheet.getName() + '" is missing the "' + header + '" column.');
    }
  });
  return map;
}

function cell_(row, map, header) {
  return row[map[header]];
}

function publicStudent_(row) {
  return {
    userId: row.userId,
    studentName: row.studentName,
    classLevel: row.classLevel,
    expiryDate: row.expiryDate,
    totalXP: row.totalXP,
    currentStreak: row.currentStreak
  };
}

function textCell_(value) {
  var text = String(value == null ? '' : value);
  if (/^[=+\-@]/.test(text)) return "'" + text;
  return text;
}

function issueToken_(role, id) {
  var token = Utilities.getUuid();
  CacheService.getScriptCache().put('iqra_' + token, JSON.stringify({ role: role, id: id }), SESSION_SECONDS);
  return token;
}

function requireRole_(token, role) {
  var raw = CacheService.getScriptCache().get('iqra_' + String(token || ''));
  if (!raw) throw new Error('Session expired. Please sign in again.');
  var session = JSON.parse(raw);
  if (!session || session.role !== role) throw new Error('You do not have access to this action.');
  return session;
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

function todayYmd_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Kolkata', 'yyyy-MM-dd');
}

function normalizeYmd_(value) {
  if (value === null || value === undefined || value === '') return '';
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone() || 'Asia/Kolkata', 'yyyy-MM-dd');
  }
  var text = String(value).trim();
  var iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return iso[1] + '-' + pad2_(iso[2]) + '-' + pad2_(iso[3]);
  var dmy = text.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
  if (dmy) return dmy[3] + '-' + pad2_(dmy[2]) + '-' + pad2_(dmy[1]);
  var parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone() || 'Asia/Kolkata', 'yyyy-MM-dd');
  }
  return '';
}

function pad2_(value) {
  return String(value).padStart(2, '0');
}
