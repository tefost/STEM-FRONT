import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { auth, can } from '../services/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sessionState, setSession] = useState(() => auth.current());

  const login = useCallback(async (email, password) => {
    const s = await auth.login(email, password);
    setSession(s);
    return s;
  }, []);

  const register = useCallback(async data => {
    const s = await auth.register(data);
    setSession(s);
    return s;
  }, []);

  const logout = useCallback(() => {
    auth.logout();
    setSession(null);
  }, []);

  useEffect(() => {
    if (!sessionState) return;
    const onActivity = () => auth.touch();
    const events = ['click', 'keydown'];
    events.forEach(e => window.addEventListener(e, onActivity, { passive: true }));
    const timer = setInterval(() => {
      if (!auth.current()) setSession(null);
    }, 30000);
    return () => {
      events.forEach(e => window.removeEventListener(e, onActivity));
      clearInterval(timer);
    };
  }, [sessionState]);

  const value = useMemo(() => ({
    user: sessionState?.user || null,
    login,
    register,
    logout,
    can: permission => can(sessionState?.user, permission)
  }), [sessionState, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
