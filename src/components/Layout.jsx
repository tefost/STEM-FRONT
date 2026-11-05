import { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES } from '../utils/constants.js';

const NAV = [
  { to: '/dashboard', label: 'Огляд', icon: 'dashboard' },
  { to: '/requirements', label: 'Вимоги', icon: 'list' },
  { to: '/tests', label: 'Тест-кейси', icon: 'checkSquare' },
  { to: '/matrix', label: 'Матриця трасування', icon: 'grid' },
  { to: '/reports', label: 'Звіти та експорт', icon: 'download' }
];

export default function Layout({ path, theme, setTheme, children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
  const initials = user.name.split(' ').map(w => w[0]).slice(0, 2).join('');

  return (
    <div className="shell">
      <a href="#main" className="skip-link" onClick={e => { e.preventDefault(); document.getElementById('main')?.focus(); }}>
        Перейти до вмісту
      </a>
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`} id="sidebar" aria-label="Головне меню">
        <div className="brand">
          <span className="brand__logo"><Icon name="check" size={16} /></span>
          <span>ReqTrace</span>
        </div>
        <nav>
          <ul className="nav">
            {NAV.map(item => {
              const active = path === item.to || path.startsWith(item.to + '/');
              return (
                <li key={item.to}>
                  <a href={'#' + item.to} className={`nav__link ${active ? 'is-active' : ''}`} aria-current={active ? 'page' : undefined}>
                    <Icon name={item.icon} />
                    <span>{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="sidebar__foot">
          <div className="user">
            <span className="avatar" aria-hidden="true">{initials}</span>
            <div className="user__meta">
              <strong>{user.name}</strong>
              <small>{ROLES[user.role]}</small>
            </div>
          </div>
          <button className="btn btn--ghost btn--block" onClick={logout}>
            <Icon name="logout" /> <span>Вийти</span>
          </button>
        </div>
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} aria-hidden="true" />}

      <div className="content">
        <header className="topbar">
          <button className="icon-btn topbar__menu" onClick={() => setOpen(o => !o)}
            aria-label="Меню" aria-expanded={open} aria-controls="sidebar">
            <Icon name="menu" />
          </button>
          <span className="topbar__title">Проєкт: Система онлайн-бронювання</span>
          <button className="icon-btn" onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={isDark ? 'Світла тема' : 'Темна тема'} title={isDark ? 'Світла тема' : 'Темна тема'}>
            <Icon name={isDark ? 'sun' : 'moon'} />
          </button>
        </header>
        <main id="main" tabIndex={-1} className="main">{children}</main>
      </div>
    </div>
  );
}
