import { useState } from 'react';
import Field from '../components/Field.jsx';
import Icon from '../components/Icon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { validateRegister, hasErrors, passwordScore } from '../utils/validation.js';
import { cleanLine } from '../utils/sanitize.js';
import { ROLES } from '../utils/constants.js';

const STRENGTH = ['Дуже слабкий', 'Слабкий', 'Середній', 'Надійний', 'Дуже надійний'];

export default function RegisterPage({ navigate }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'analyst' });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState('idle');
  const [message, setMessage] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const score = passwordScore(form.password);

  const submit = async e => {
    e.preventDefault();
    const data = { ...form, name: cleanLine(form.name, 60) };
    const errs = validateRegister(data);
    setErrors(errs);
    if (hasErrors(errs)) return;
    setState('loading');
    try {
      await register(data);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setState('error');
      setMessage(err.message);
    }
  };

  return (
    <div className="auth">
      <div className="auth__card">
        <div className="brand brand--center">
          <span className="brand__logo"><Icon name="check" size={16} /></span>
          <span>ReqTrace</span>
        </div>
        <h1>Реєстрація</h1>
        <form className="form" onSubmit={submit} noValidate>
          <Field label="Імʼя та прізвище" error={errors.name} required>
            {p => <input {...p} autoComplete="name" value={form.name} maxLength={60} onChange={e => set('name', e.target.value)} />}
          </Field>
          <Field label="E-mail" error={errors.email} required>
            {p => <input {...p} type="email" autoComplete="email" value={form.email} maxLength={254} onChange={e => set('email', e.target.value)} />}
          </Field>
          <Field label="Роль у команді" error={errors.role}>
            {p => <select {...p} value={form.role} onChange={e => set('role', e.target.value)}>
              {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>}
          </Field>
          <Field label="Пароль" error={errors.password} required>
            {p => <input {...p} type="password" autoComplete="new-password" value={form.password} maxLength={128} onChange={e => set('password', e.target.value)} />}
          </Field>
          {form.password && (
            <div className="strength" aria-live="polite">
              <div className="strength__bar"><span style={{ width: `${(score / 4) * 100}%` }} className={`s${score}`} /></div>
              <small>{STRENGTH[score]}</small>
            </div>
          )}
          <Field label="Підтвердження пароля" error={errors.confirm} required>
            {p => <input {...p} type="password" autoComplete="new-password" value={form.confirm} maxLength={128} onChange={e => set('confirm', e.target.value)} />}
          </Field>
          {message && <p className="form__alert" role="alert">{message}</p>}
          <button className="btn btn--primary btn--block" disabled={state === 'loading'}>
            {state === 'loading' && <span className="spinner" aria-hidden="true" />}
            {state === 'loading' ? 'Створення…' : 'Зареєструватися'}
          </button>
        </form>
        <p className="auth__alt">Вже маєте обліковий запис? <a href="#/login">Увійти</a></p>
      </div>
    </div>
  );
}
