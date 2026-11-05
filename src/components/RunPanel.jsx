import { useState } from 'react';
import Icon from './Icon.jsx';
import { TC_STATUSES } from '../utils/constants.js';
import { cleanText } from '../utils/sanitize.js';

const RESULTS = ['passed', 'failed', 'blocked'];

export default function RunPanel({ testCase, onRun, onCancel }) {
  const [phase, setPhase] = useState('running');
  const [checked, setChecked] = useState(() => testCase.steps.map(() => false));
  const [result, setResult] = useState('passed');
  const [comment, setComment] = useState('');

  const finish = async () => {
    setPhase('saving');
    try {
      await onRun(result, cleanText(comment, 500));
    } catch {
      setPhase('running');
    }
  };

  const done = checked.filter(Boolean).length;
  const needComment = result !== 'passed' && !comment.trim();

  return (
    <section className="card run" aria-label="Виконання тест-кейсу">
      <h2><Icon name="play" size={16} /> Прогін {testCase.id}</h2>
      <p className="muted">Позначте виконані кроки: {done} з {testCase.steps.length}</p>
      <ol className="run__steps">
        {testCase.steps.map((s, i) => (
          <li key={i}>
            <label className="run__step">
              <input type="checkbox" checked={checked[i] || false}
                onChange={() => setChecked(c => c.map((v, idx) => (idx === i ? !v : v)))} />
              <span><strong>{s.action}</strong><br /><small className="muted">Очікувано: {s.expected}</small></span>
            </label>
          </li>
        ))}
      </ol>
      <fieldset className="fieldset">
        <legend>Результат</legend>
        <div className="segmented">
          {RESULTS.map(r => (
            <label key={r} className={`segmented__opt seg--${r} ${result === r ? 'is-on' : ''}`}>
              <input type="radio" name="result" value={r} checked={result === r} onChange={() => setResult(r)} />
              {TC_STATUSES[r]}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="field">
        <span className="field__label">Коментар{result !== 'passed' && <span className="req-mark"> *</span>}</span>
        <textarea rows={3} value={comment} maxLength={500} onChange={e => setComment(e.target.value)}
          placeholder={result === 'passed' ? 'Необовʼязково' : 'Опишіть дефект або причину блокування'} />
      </label>
      <div className="run__actions">
        <button className="btn btn--ghost" onClick={onCancel} disabled={phase === 'saving'}>Скасувати</button>
        <button className="btn btn--primary" onClick={finish}
          disabled={phase === 'saving' || needComment || (result === 'passed' && done < testCase.steps.length)}>
          {phase === 'saving' ? 'Збереження…' : 'Зафіксувати результат'}
        </button>
      </div>
      {result === 'passed' && done < testCase.steps.length && (
        <p className="muted small">Для статусу «Пройдено» позначте всі кроки.</p>
      )}
    </section>
  );
}
