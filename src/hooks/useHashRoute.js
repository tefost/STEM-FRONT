import { useEffect, useState, useCallback } from 'react';

function parse() {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [path, query = ''] = raw.split('?');
  return { path: path || '/', query: new URLSearchParams(query) };
}

export function navigate(to, { replace = false } = {}) {
  const target = '#' + to;
  if (replace) window.history.replaceState(null, '', target);
  else window.location.hash = to;
  if (replace) window.dispatchEvent(new HashChangeEvent('hashchange'));
}

export function matchRoute(pattern, path) {
  const p = pattern.split('/').filter(Boolean);
  const s = path.split('/').filter(Boolean);
  if (p.length !== s.length) return null;
  const params = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodeURIComponent(s[i]);
    else if (p[i] !== s[i]) return null;
  }
  return params;
}

export function useHashRoute() {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const onChange = () => {
      setRoute(parse());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  const go = useCallback((to, opts) => navigate(to, opts), []);
  return { ...route, navigate: go };
}
