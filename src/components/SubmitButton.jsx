import Icon from './Icon.jsx';

const TEXT = { loading: 'Збереження…', success: 'Збережено', error: 'Повторити' };

export default function SubmitButton({ state = 'idle', disabled, children, form }) {
  return (
    <button type="submit" form={form} className={`btn btn--primary btn--${state}`}
      disabled={disabled || state === 'loading'} aria-busy={state === 'loading'}>
      {state === 'loading' && <span className="spinner" aria-hidden="true" />}
      {state === 'success' && <Icon name="check" />}
      {state === 'error' && <Icon name="alert" />}
      <span>{TEXT[state] || children}</span>
    </button>
  );
}
