/**
 * In-memory stand-in for Code.gs. The preview server injects this.
 * The deployed web app uses the real spreadsheet functions instead.
 */
(function () {
  var admins = [{ id: 'admin', password: 'Excellence@2026' }];
  var students = [
    { userId: 'IQRA001', password: 'Learn@2026', studentName: 'Ayesha Khan', classLevel: 6, expiryDate: '2027-03-31', totalXP: 120, currentStreak: 3 },
    { userId: 'IQRA002', password: 'Learn@2026', studentName: 'Arhaan Shaikh', classLevel: 3, expiryDate: '2027-03-31', totalXP: 40, currentStreak: 1 },
    { userId: 'IQRA010', password: 'Learn@2026', studentName: 'Zoya Ansari', classLevel: 10, expiryDate: '2027-03-31', totalXP: 80, currentStreak: 2 },
    { userId: 'IQRA000', password: 'Expired@2026', studentName: 'Expired Demo', classLevel: 4, expiryDate: '2024-01-01', totalXP: 10, currentStreak: 0 }
  ];
  var sessions = {};

  function today() {
    var date = new Date();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
    return date.getFullYear() + '-' + month + '-' + day;
  }

  function publicStudent(row) {
    return {
      userId: row.userId,
      studentName: row.studentName,
      classLevel: row.classLevel,
      expiryDate: row.expiryDate,
      totalXP: row.totalXP,
      currentStreak: row.currentStreak
    };
  }

  function issue(role, id) {
    var token = 'demo-' + Math.random().toString(36).slice(2);
    sessions[token] = { role: role, id: id };
    return token;
  }

  function requireRole(token, role) {
    var session = sessions[token];
    if (!session) throw new Error('Session expired. Please sign in again.');
    if (session.role !== role) throw new Error('You do not have access to this action.');
    return session;
  }

  var handlers = {
    login: function (userId, password) {
      userId = String(userId || '').trim();
      password = String(password == null ? '' : password);
      if (!userId || !password) return { ok: false, error: 'Enter your ID and password.' };
      var admin = admins.filter(function (row) { return row.id.toLowerCase() === userId.toLowerCase() && row.password === password; })[0];
      if (admin) return { ok: true, role: 'admin', token: issue('admin', admin.id), admin: { adminId: admin.id } };
      var student = students.filter(function (row) { return row.userId.toLowerCase() === userId.toLowerCase(); })[0];
      if (!student || student.password !== password) return { ok: false, error: 'Invalid Login ID or Password.' };
      if (!student.expiryDate || today() > student.expiryDate) return { ok: false, error: 'Account Expired. Please contact Admin.' };
      return { ok: true, role: 'student', token: issue('student', student.userId), student: publicStudent(student) };
    },
    listStudents: function (token) {
      requireRole(token, 'admin');
      var stamp = today();
      return {
        ok: true,
        students: students.map(function (row) {
          var copy = publicStudent(row);
          copy.expired = !row.expiryDate || stamp > row.expiryDate;
          return copy;
        })
      };
    },
    saveStudent: function (token, payload, mode) {
      requireRole(token, 'admin');
      payload = payload || {};
      var userId = String(payload.userId || '').trim();
      var password = String(payload.password == null ? '' : payload.password);
      var studentName = String(payload.studentName || '').trim();
      var classLevel = parseInt(payload.classLevel, 10);
      var expiryDate = String(payload.expiryDate || '');
      if (!userId || !studentName) return { ok: false, error: 'User ID and student name are required.' };
      if (!/^[A-Za-z0-9._@-]{3,40}$/.test(userId)) return { ok: false, error: 'User ID must be 3–40 letters, numbers, or . _ @ -' };
      if (!(classLevel >= 1 && classLevel <= 10)) return { ok: false, error: 'Class must be between 1 and 10.' };
      if (!/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) return { ok: false, error: 'Set a valid expiry date.' };
      var index = -1;
      students.forEach(function (row, i) { if (row.userId.toLowerCase() === userId.toLowerCase()) index = i; });
      if (mode === 'update') {
        if (index < 0) return { ok: false, error: 'Student not found.' };
        if (!password) password = students[index].password;
      } else if (index >= 0) {
        return { ok: false, error: 'That User ID already exists.' };
      }
      if (password.length < 4) return { ok: false, error: 'Password must be at least 4 characters.' };
      var record = {
        userId: userId,
        password: password,
        studentName: studentName,
        classLevel: classLevel,
        expiryDate: expiryDate,
        totalXP: mode === 'update' ? students[index].totalXP : 0,
        currentStreak: mode === 'update' ? students[index].currentStreak : 0
      };
      if (mode === 'update') students[index] = record;
      else students.push(record);
      return { ok: true };
    },
    recordTestResult: function (token, xpEarned) {
      var session = requireRole(token, 'student');
      xpEarned = Math.round(Number(xpEarned));
      if (!isFinite(xpEarned) || xpEarned < 0 || xpEarned > 500) return { ok: false, error: 'XP amount was not accepted.' };
      var row = students.filter(function (item) { return item.userId === session.id; })[0];
      if (!row) return { ok: false, error: 'Student record was not found.' };
      if (!row.expiryDate || today() > row.expiryDate) return { ok: false, error: 'Account Expired. Please contact Admin.' };
      row.totalXP += xpEarned;
      row.currentStreak += 1;
      return { ok: true, student: publicStudent(row) };
    }
  };

  function runner() {
    var chain = {
      _ok: function () {},
      _err: function () {},
      withSuccessHandler: function (fn) { this._ok = fn; return this; },
      withFailureHandler: function (fn) { this._err = fn; return this; }
    };
    Object.keys(handlers).forEach(function (name) {
      chain[name] = function () {
        var args = arguments;
        var ok = chain._ok;
        var err = chain._err;
        setTimeout(function () {
          try { ok(handlers[name].apply(null, args)); }
          catch (failure) { err(failure); }
        }, 220);
      };
    });
    return chain;
  }

  window.google = { script: { run: runner() } };

  window.addEventListener('DOMContentLoaded', function () {
    var card = document.querySelector('.login-card');
    if (!card) return;
    var note = document.createElement('p');
    note.className = 'hint';
    note.style.marginTop = '14px';
    note.textContent = 'Local preview: admin / Excellence@2026 · IQRA001 / Learn@2026 · IQRA000 is expired.';
    card.appendChild(note);
  });
})();
