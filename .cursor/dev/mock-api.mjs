/**
 * In-memory API mirror of Code.gs sample data for local Cloud Agent / browser dev.
 * Production uses Google Sheets via google.script.run.
 */

const TZ = 'Asia/Kolkata';

const admins = [{ adminId: 'admin', adminPass: 'ChangeMe123' }];

function atNoon(date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return d;
}

const nextYear = new Date();
nextYear.setFullYear(nextYear.getFullYear() + 1);
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

let students = [
  {
    userId: 'STD001',
    password: 'pass123',
    studentName: 'Ayesha Khan',
    classLevel: 5,
    expiry: atNoon(nextYear),
    totalXP: 120,
    currentStreak: 3,
  },
  {
    userId: 'STD002',
    password: 'pass123',
    studentName: 'Rahul Patil',
    classLevel: 8,
    expiry: atNoon(yesterday),
    totalXP: 40,
    currentStreak: 1,
  },
];

const sessions = new Map();
const xpNonces = new Set();

function fail(error) {
  return { ok: false, error };
}

function cleanId(id) {
  return String(id || '')
    .trim()
    .replace(/\s+/g, '')
    .toUpperCase();
}

function formatDateKey(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const y = parts.find((p) => p.type === 'year').value;
  const m = parts.find((p) => p.type === 'month').value;
  const d = parts.find((p) => p.type === 'day').value;
  return `${y}-${m}-${d}`;
}

function isExpired(expiry) {
  if (!expiry) return true;
  const today = formatDateKey(new Date());
  const exp = formatDateKey(expiry instanceof Date ? expiry : new Date(expiry));
  return today > exp;
}

function publicStudent(s) {
  return {
    userId: s.userId,
    studentName: s.studentName,
    classLevel: s.classLevel,
    expiryDate: formatDateKey(s.expiry),
    totalXP: s.totalXP,
    currentStreak: s.currentStreak,
  };
}

function issueToken(role, id) {
  const token =
    'mock_' +
    role +
    '_' +
    id +
    '_' +
    Math.random().toString(36).slice(2, 12);
  sessions.set(token, { role, id, created: Date.now() });
  return token;
}

function readSession(token) {
  if (!token) return null;
  return sessions.get(String(token)) || null;
}

function findStudent(userId) {
  const id = cleanId(userId);
  return students.find((s) => cleanId(s.userId) === id) || null;
}

export function handleMockApi(action, payload) {
  payload = payload && typeof payload === 'object' ? payload : {};

  switch (String(action || '')) {
    case 'login': {
      const userId = cleanId(payload.userId);
      const password = String(payload.password ?? '');
      if (!userId || !password) return fail('Enter your ID and password.');

      const admin = admins.find((a) => cleanId(a.adminId) === userId);
      if (admin && admin.adminPass === password) {
        return {
          ok: true,
          role: 'admin',
          token: issueToken('admin', userId),
          profile: { displayName: 'Administrator', userId },
        };
      }

      const student = findStudent(userId);
      if (!student || student.password !== password) {
        return fail('Invalid ID or password.');
      }
      if (!student.expiry || isExpired(student.expiry)) {
        return fail('Account Expired. Please contact Admin.');
      }
      return {
        ok: true,
        role: 'student',
        token: issueToken('student', student.userId),
        profile: publicStudent(student),
      };
    }

    case 'logout': {
      const token = String(payload.token || '');
      if (token) sessions.delete(token);
      return { ok: true };
    }

    case 'session': {
      const session = readSession(payload.token);
      if (!session) return fail('Your session has ended. Please sign in again.');
      if (session.role === 'admin') {
        return {
          ok: true,
          role: 'admin',
          token: payload.token,
          profile: { displayName: 'Administrator', userId: session.id },
        };
      }
      const student = findStudent(session.id);
      if (!student || !student.expiry || isExpired(student.expiry)) {
        sessions.delete(payload.token);
        return fail('Account Expired. Please contact Admin.');
      }
      return {
        ok: true,
        role: 'student',
        token: payload.token,
        profile: publicStudent(student),
      };
    }

    case 'listStudents': {
      const session = readSession(payload.token);
      if (!session || session.role !== 'admin') return fail('Admin sign-in required.');
      return { ok: true, students: students.map(publicStudent) };
    }

    case 'addStudent':
    case 'updateStudent':
    case 'deleteStudent':
    case 'updateXP': {
      // Enough for login + navigation demo; extend when testing admin/math flows locally.
      return fail('Not implemented in local mock. Deploy to Apps Script for full API.');
    }

    default:
      return fail('Unknown request.');
  }
}

export function mockApiScript() {
  return `
window.IQRA_MOCK = async function(action, payload) {
  const res = await fetch('/__mock_api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload })
  });
  return res.json();
};
`;
}
