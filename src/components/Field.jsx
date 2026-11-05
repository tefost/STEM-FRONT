import { useId } from 'react';

export default function Field({ label, error, hint, children, required }) {
  const id = useId();
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;
  const child = typeof children === 'function'
    ? children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy, required })
    : children;
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label htmlFor={id} className="field__label">
        {label}{required && <span className="req-mark" aria-hidden="true"> *</span>}
      </label>
      {child}
      {hint && !error && <small id={hintId} className="field__hint">{hint}</small>}
      {error && <small id={errId} className="field__error" role="alert">{error}</small>}
    </div>
  );
}
