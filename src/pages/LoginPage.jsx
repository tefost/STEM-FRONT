import { useEffect, useState } from 'react';
import Field from '../components/Field.jsx';
import Icon from '../components/Icon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { auth, lockRemaining } from '../services/auth.js';
import { validateLogin, hasErrors } from '../utils/validation.js';
import { ROLES } from '../utils/constants.js';

export default function LoginPage({ navigate }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState('idle');
  const [message, setMessage] = useState('');
  const [show, setShow] = useState(false);
  const [lock, setLock] = useState(lockRemaining());

  useEffect(() => {
    if (!lock) return;
    const t = setInterval(() => setLock(lockRemaining()), 1000);
    return () => clearInterval(t);
  }, [lock]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async e => {
    e.preventDefault();
    const errs = validateLogin(form);
    setErrors(errs);
    if (hasErrors(errs)) return;
    setState('loading');
    setMessage('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setState('error');
      setMessage(err.message);
      setLock(lockRemaining());
    }
  };

  return (
    <div className="auth">
      <div className="auth__card">
        <div className="brand brand--center">
          <span className="brand__logo"><Icon name="check" size={16} /></span>
          <span>ReqTrace</span>
        </div>
        <h1>Вхід до системи</h1>
        <p className="muted">Управління вимогами та тест-кейсами</p>
        <form className="form" onSubmit={submit} noValidate>
          <Field label="E-mail" error={errors.email} required>
            {p => <input {...p} type="email" autoComplete="username" value={form.email} maxLength={254}
              onChange={e => set('email', e.target.value)} />}
          </Field>
          <Field label="Пароль" error={errors.password} required>
            {p => (
              <div className="pw">
                <input {...p} type={show ? 'text' : 'password'} autoComplete="current-password" value={form.password}
                  maxLength={128} onChange={e => set('password', e.target.value)} />
                <button type="button" className="icon-btn" onClick={() => setShow(s => !s)}
                  aria-label={show ? 'Сховати пароль' : 'Показати пароль'}>
                  <Icon name={show ? 'eyeOff' : 'eye'} />
                </button>
              </div>
            )}
          </Field>
          {message && <p className="form__alert" role="alert">{lock ? `Забагато спроб. Спробуйте через ${lock} с` : message}</p>}
          <button className="btn btn--primary btn--block" disabled={state === 'loading' || lock > 0}>
            {state === 'loading' && <span className="spinner" aria-hidden="true" />}
            {state === 'loading' ? 'Перевірка…' : 'Увійти'}
          </button>
        </form>
        <p className="auth__alt">Немає облікового запису? <a href="#/register">Зареєструватися</a></p>
        <details className="demo">
          <summary>Демо-доступ</summary>
          <ul>
            {auth.demoAccounts.map(a => (
              <li key={a.email}>
                <button type="button" className="link-btn" onClick={() => setForm({ email: a.email, password: a.password })}>
                  {ROLES[a.role]}
                </button>
                <code>{a.email}</code>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  );
}
