import { useState } from 'react';
import Modal from './Modal.jsx';
import Field from './Field.jsx';
import SubmitButton from './SubmitButton.jsx';
import { PRIORITIES, REQ_STATUSES, REQ_TYPES, LIMITS } from '../utils/constants.js';
import { validateRequirement, hasErrors } from '../utils/validation.js';
import { cleanLine, cleanText } from '../utils/sanitize.js';

const EMPTY = { title: '', description: '', type: 'functional', priority: 'medium', status: 'draft' };

export default function RequirementForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(() => ({ ...EMPTY, ...initial }));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);
  const [state, setState] = useState('idle');

  const set = (k, v) => {
    const next = { ...form, [k]: v };
    setForm(next);
    if (touched) setErrors(validateRequirement(next));
  };

  const submit = async e => {
    e.preventDefault();
    setTouched(true);
    const clean = { ...form, title: cleanLine(form.title, LIMITS.title), description: cleanText(form.description, LIMITS.text) };
    const errs = validateRequirement(clean);
    setErrors(errs);
    if (hasErrors(errs)) return;
    setState('loading');
    try {
      await onSave(clean);
      setState('success');
      setTimeout(onClose, 500);
    } catch {
      setState('error');
    }
  };

  return (
    <Modal title={initial?.id ? `Редагування ${initial.id}` : 'Нова вимога'} onClose={onClose}
      footer={<>
        <button type="button" className="btn btn--ghost" onClick={onClose}>Скасувати</button>
        <SubmitButton form="req-form" state={state}>Зберегти</SubmitButton>
      </>}>
      <form id="req-form" className="form" onSubmit={submit} noValidate>
        <Field label="Назва" error={errors.title} required hint={`${form.title.length}/${LIMITS.title}`}>
          {p => <input {...p} value={form.title} maxLength={LIMITS.title} onChange={e => set('title', e.target.value)} autoComplete="off" />}
        </Field>
        <Field label="Опис" error={errors.description} required>
          {p => <textarea {...p} rows={5} value={form.description} maxLength={LIMITS.text} onChange={e => set('description', e.target.value)} />}
        </Field>
        <div className="form__row">
          <Field label="Тип" error={errors.type}>
            {p => <select {...p} value={form.type} onChange={e => set('type', e.target.value)}>
              {Object.entries(REQ_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>}
          </Field>
          <Field label="Пріоритет" error={errors.priority}>
            {p => <select {...p} value={form.priority} onChange={e => set('priority', e.target.value)}>
              {Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>}
          </Field>
          <Field label="Статус" error={errors.status}>
            {p => <select {...p} value={form.status} onChange={e => set('status', e.target.value)}>
              {Object.entries(REQ_STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>}
          </Field>
        </div>
        {state === 'error' && <p className="form__alert" role="alert">Не вдалося зберегти. Спробуйте ще раз.</p>}
      </form>
    </Modal>
  );
}
