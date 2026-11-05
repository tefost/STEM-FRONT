import { useState } from 'react';
import Modal from './Modal.jsx';
import Field from './Field.jsx';
import Icon from './Icon.jsx';
import SubmitButton from './SubmitButton.jsx';
import { PRIORITIES, LIMITS } from '../utils/constants.js';
import { validateTestCase, hasErrors } from '../utils/validation.js';
import { cleanLine, cleanText } from '../utils/sanitize.js';

const EMPTY = { title: '', precondition: '', priority: 'medium', requirementIds: [], steps: [{ action: '', expected: '' }] };

export default function TestCaseForm({ initial, requirements, onSave, onClose }) {
  const [form, setForm] = useState(() => ({ ...EMPTY, ...initial, steps: initial?.steps?.map(s => ({ ...s })) || EMPTY.steps }));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);
  const [state, setState] = useState('idle');

  const update = next => {
    setForm(next);
    if (touched) setErrors(validateTestCase(next));
  };
  const set = (k, v) => update({ ...form, [k]: v });
  const setStep = (i, k, v) => set('steps', form.steps.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)));
  const addStep = () => form.steps.length < LIMITS.steps && set('steps', [...form.steps, { action: '', expected: '' }]);
  const removeStep = i => set('steps', form.steps.filter((_, idx) => idx !== i));
  const moveStep = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= form.steps.length) return;
    const steps = [...form.steps];
    [steps[i], steps[j]] = [steps[j], steps[i]];
    set('steps', steps);
  };
  const toggleReq = id => set('requirementIds', form.requirementIds.includes(id)
    ? form.requirementIds.filter(x => x !== id)
    : [...form.requirementIds, id]);

  const submit = async e => {
    e.preventDefault();
    setTouched(true);
    const clean = {
      ...form,
      title: cleanLine(form.title, LIMITS.title),
      precondition: cleanText(form.precondition, LIMITS.step),
      steps: form.steps.map(s => ({ action: cleanText(s.action, LIMITS.step), expected: cleanText(s.expected, LIMITS.step) }))
    };
    const errs = validateTestCase(clean);
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
    <Modal size="lg" title={initial?.id ? `Редагування ${initial.id}` : 'Новий тест-кейс'} onClose={onClose}
      footer={<>
        <button type="button" className="btn btn--ghost" onClick={onClose}>Скасувати</button>
        <SubmitButton form="tc-form" state={state}>Зберегти</SubmitButton>
      </>}>
      <form id="tc-form" className="form" onSubmit={submit} noValidate>
        <Field label="Назва" error={errors.title} required>
          {p => <input {...p} value={form.title} maxLength={LIMITS.title} onChange={e => set('title', e.target.value)} autoComplete="off" />}
        </Field>
        <div className="form__row form__row--2">
          <Field label="Передумова">
            {p => <input {...p} value={form.precondition} maxLength={LIMITS.step} onChange={e => set('precondition', e.target.value)} />}
          </Field>
          <Field label="Пріоритет" error={errors.priority}>
            {p => <select {...p} value={form.priority} onChange={e => set('priority', e.target.value)}>
              {Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>}
          </Field>
        </div>

        <fieldset className={`fieldset ${errors.requirementIds ? 'field--error' : ''}`}>
          <legend>Повʼязані вимоги <span className="req-mark">*</span></legend>
          <div className="chips">
            {requirements.map(r => (
              <label key={r.id} className={`chip ${form.requirementIds.includes(r.id) ? 'chip--on' : ''}`} title={r.title}>
                <input type="checkbox" checked={form.requirementIds.includes(r.id)} onChange={() => toggleReq(r.id)} />
                {r.id}
              </label>
            ))}
          </div>
          {errors.requirementIds && <small className="field__error" role="alert">{errors.requirementIds}</small>}
        </fieldset>

        <fieldset className={`fieldset ${errors.steps ? 'field--error' : ''}`}>
          <legend>Кроки виконання <span className="req-mark">*</span></legend>
          <ol className="steps-edit">
            {form.steps.map((s, i) => (
              <li key={i} className="step-edit">
                <span className="step-edit__n" aria-hidden="true">{i + 1}</span>
                <div className="step-edit__fields">
                  <textarea rows={2} placeholder="Дія" value={s.action} maxLength={LIMITS.step}
                    aria-label={`Крок ${i + 1}: дія`} onChange={e => setStep(i, 'action', e.target.value)} />
                  <textarea rows={2} placeholder="Очікуваний результат" value={s.expected} maxLength={LIMITS.step}
                    aria-label={`Крок ${i + 1}: очікуваний результат`} onChange={e => setStep(i, 'expected', e.target.value)} />
                </div>
                <div className="step-edit__tools">
                  <button type="button" className="icon-btn" onClick={() => moveStep(i, -1)} disabled={i === 0} aria-label={`Підняти крок ${i + 1}`}><Icon name="arrowUp" size={16} /></button>
                  <button type="button" className="icon-btn" onClick={() => moveStep(i, 1)} disabled={i === form.steps.length - 1} aria-label={`Опустити крок ${i + 1}`}><Icon name="arrowDown" size={16} /></button>
                  <button type="button" className="icon-btn icon-btn--danger" onClick={() => removeStep(i)} disabled={form.steps.length === 1} aria-label={`Видалити крок ${i + 1}`}><Icon name="trash" size={16} /></button>
                </div>
              </li>
            ))}
          </ol>
          <button type="button" className="btn btn--ghost btn--sm" onClick={addStep}><Icon name="plus" /> Додати крок</button>
          {errors.steps && <small className="field__error" role="alert">{errors.steps}</small>}
        </fieldset>
        {state === 'error' && <p className="form__alert" role="alert">Не вдалося зберегти. Спробуйте ще раз.</p>}
      </form>
    </Modal>
  );
}
