import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Icon from '../components/Icon.jsx';

const ToastContext = createContext(null);
let seq = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback(id => setToasts(t => t.filter(x => x.id !== id)), []);

  const notify = useCallback((message, type = 'success') => {
    const id = ++seq;
    setToasts(t => [...t.slice(-3), { id, message, type }]);
    setTimeout(() => dismiss(id), 3500);
  }, [dismiss]);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast--${t.type}`}>
            <Icon name={t.type === 'error' ? 'alert' : 'check'} />
            <span>{t.message}</span>
            <button className="icon-btn" onClick={() => dismiss(t.id)} aria-label="Закрити сповіщення">
              <Icon name="x" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
