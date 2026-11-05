const PREFIX = 'reqtrace.';

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      /* ignore */
    }
  }
};

export const session = {
  get() {
    try {
      const raw = sessionStorage.getItem(PREFIX + 'session');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  set(value) {
    try {
      sessionStorage.setItem(PREFIX + 'session', JSON.stringify(value));
    } catch {
      /* ignore */
    }
  },
  clear() {
    try {
      sessionStorage.removeItem(PREFIX + 'session');
    } catch {
      /* ignore */
    }
  }
};
