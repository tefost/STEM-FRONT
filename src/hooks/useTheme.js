import { useEffect, useState } from 'react';
import { storage } from '../services/storage.js';

export function useTheme() {
  const [theme, setTheme] = useState(() => storage.get('theme', 'system'));
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    storage.set('theme', theme);
  }, [theme]);
  return [theme, setTheme];
}
