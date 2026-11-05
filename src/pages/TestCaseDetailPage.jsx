import { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import Badge from '../components/Badge.jsx';
import Icon from '../components/Icon.jsx';
import EmptyState from '../components/EmptyState.jsx';
import TestCaseForm from '../components/TestCaseForm.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import RunPanel from '../components/RunPanel.jsx';
import { useData } from '../context/DataContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate } from '../utils/format.js';
import { TC_STATUSES } from '../utils/constants.js';

export default function TestCaseDetailPage({ id, navigate }) {
  const { requirements, testCases, saveTestCase, deleteTestCase, runTestCase } = useData();
  const { user, can } = useAuth();
  const { notify } = useToast();
  const [edit, setEdit] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [running, setRunning] = useState(false);
  const tc = testCases.find(t => t.id === id);

  if (!tc) {
    return <EmptyState icon="alert" title="Тест-кейс не знайдено" text={`Запис ${id} відсутній або був видалений.`}
      action={<a className="btn btn--ghost" href="#/tests">До списку тест-кейсів</a>} />;
  }

  const linked = requirements.filter(r => tc.requirementIds.includes(r.id));

  return (
    <>
      <PageHeader
        back={<a href="#/tests" className="back"><Icon name="arrowLeft" size={16} /> Тест-кейси</a>}
        title={<><code>{tc.id}</code> {tc.title}</>}
        actions={<>
          {can('tc:run') && !running && <button className="btn btn--primary" onClick={() => setRunning(true)}><Icon name="play" /> Виконати тест</button>}
          {can('tc:edit') && <button className="btn btn--ghost" onClick={() => setEdit(true)}><Icon name="edit" /> Редагувати</button>}
          {can('tc:delete') && <button className="btn btn--danger-ghost" onClick={() => setConfirm(true)}><Icon name="trash" /> Видалити</button>}
        </>} />

      {running && <RunPanel testCase={tc} onCancel={() => setRunning(false)}
        onRun={async (status, comment) => {
          await runTestCase(tc.id, status, comment, user.name);
          setRunning(false);
          notify(`Результат: ${TC_STATUSES[status]}`, status === 'passed' ? 'success' : 'error');
        }} />}

      <div className="grid-detail">
        <section className="card">
          <h2>Сценарій</h2>
          {tc.precondition && <p><strong>Передумова:</strong> {tc.precondition}</p>}
          <ol className="steps">
            {tc.steps.map((s, i) => (
              <li key={i}>
                <div className="steps__action">{s.action}</div>
                <div className="steps__expected"><span className="muted">Очікувано:</span> {s.expected}</div>
              </li>
            ))}
          </ol>
        </section>
        <div className="stack">
          <section className="card">
            <h2>Властивості</h2>
            <dl className="meta">
              <div><dt>Результат</dt><dd><Badge kind="tc" value={tc.status} /></dd></div>
              <div><dt>Пріоритет</dt><dd><Badge kind="priority" value={tc.priority} /></dd></div>
              <div><dt>Останній прогін</dt><dd>{formatDate(tc.lastRunAt)}</dd></div>
            </dl>
            <h3>Покриває вимоги</h3>
            <ul className="list">
              {linked.map(r => <li key={r.id}><a href={`#/requirements/${r.id}`}><code>{r.id}</code> {r.title}</a></li>)}
            </ul>
          </section>
          <section className="card">
            <h2>Історія прогонів</h2>
            {tc.history.length === 0 ? <p className="muted">Тест ще не виконувався.</p> : (
              <ol className="timeline">
                {tc.history.map((h, i) => (
                  <li key={i}>
                    <Badge kind="tc" value={h.status} />
                    <small className="muted">{formatDate(h.date)} · {h.by}</small>
                    {h.comment && <p className="prewrap">{h.comment}</p>}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>

      {edit && <TestCaseForm initial={tc} requirements={requirements} onClose={() => setEdit(false)}
        onSave={async d => { await saveTestCase(d); notify(`Тест-кейс ${tc.id} оновлено`); }} />}
      {confirm && <ConfirmDialog title={`Видалити ${tc.id}?`} onClose={() => setConfirm(false)}
        text="Тест-кейс та історію його прогонів буде видалено. Дію неможливо скасувати."
        onConfirm={async () => { await deleteTestCase(tc.id); notify(`Тест-кейс ${tc.id} видалено`); navigate('/tests'); }} />}
    </>
  );
}
