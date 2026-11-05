import { storage, session } from './storage.js';

const USERS_KEY = 'users.v1';
const ATTEMPTS_KEY = 'attempts';
const SESSION_TTL = 30 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const LOCK_MS = 60 * 1000;

const DEMO = [
  { name: 'Олена Коваль', email: 'analyst@reqtrace.dev', password: 'Analyst#2026', role: 'analyst' },
  { name: 'Ігор Мельник', email: 'tester@reqtrace.dev', password: 'Tester#2026', role: 'tester' }
];

function randomHex(bytes = 16) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

async function hash(password, salt) {
  const data = new TextEncoder().encode(salt + ':' + password);
  if (crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 0x811c9dc5;
  for (const b of data) h = Math.imul(h ^ b, 0x01000193) >>> 0;
  return h.toString(16);
}

async function getUsers() {
  let users = storage.get(USERS_KEY);
  if (Array.isArray(users) && users.length) return users;
  users = [];
  for (const d of DEMO) {
    const salt = randomHex();
    users.push({ name: d.name, email: d.email, role: d.role, salt, hash: await hash(d.password, salt) });
  }
  storage.set(USERS_KEY, users);
  return users;
}

function publicUser(u) {
  return { name: u.name, email: u.email, role: u.role };
}

function lockState() {
  const a = storage.get(ATTEMPTS_KEY, { count: 0, until: 0 });
  return a;
}

export function lockRemaining() {
  const a = lockState();
  return a.until > Date.now() ? Math.ceil((a.until - Date.now()) / 1000) : 0;
}

export const auth = {
  demoAccounts: DEMO.map(({ email, password, role }) => ({ email, password, role })),

  async login(email, password) {
    await new Promise(r => setTimeout(r, 400));
    const remaining = lockRemaining();
    if (remaining) throw new Error(`Забагато спроб. Спробуйте через ${remaining} с`);
    const users = await getUsers();
    const user = users.find(u => u.email === email.trim().toLowerCase());
    const ok = user && (await hash(password, user.salt)) === user.hash;
    if (!ok) {
      const a = lockState();
      const count = a.count + 1;
      storage.set(ATTEMPTS_KEY, count >= MAX_ATTEMPTS ? { count: 0, until: Date.now() + LOCK_MS } : { count, until: 0 });
      throw new Error('Невірний e-mail або пароль');
    }
    storage.remove(ATTEMPTS_KEY);
    const s = { user: publicUser(user), token: randomHex(24), expires: Date.now() + SESSION_TTL };
    session.set(s);
    return s;
  },

  async register({ name, email, password, role }) {
    await new Promise(r => setTimeout(r, 400));
    const users = await getUsers();
    const norm = email.trim().toLowerCase();
    if (users.some(u => u.email === norm)) throw new Error('Користувач з таким e-mail вже існує');
    const salt = randomHex();
    const user = { name: name.trim(), email: norm, role, salt, hash: await hash(password, salt) };
    storage.set(USERS_KEY, [...users, user]);
    const s = { user: publicUser(user), token: randomHex(24), expires: Date.now() + SESSION_TTL };
    session.set(s);
    return s;
  },

  current() {
    const s = session.get();
    if (!s || !s.token || s.expires < Date.now()) {
      session.clear();
      return null;
    }
    return s;
  },

  touch() {
    const s = this.current();
    if (s) session.set({ ...s, expires: Date.now() + SESSION_TTL });
  },

  logout() {
    session.clear();
  }
};

export const PERMISSIONS = {
  analyst: ['req:edit', 'req:delete', 'tc:view'],
  tester: ['tc:edit', 'tc:delete', 'tc:run', 'req:view']
};

export function can(user, permission) {
  return Boolean(user && PERMISSIONS[user.role]?.includes(permission));
}
