import { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import Badge from '../components/Badge.jsx';
import Icon from '../components/Icon.jsx';
import EmptyState from '../components/EmptyState.jsx';
import RequirementForm from '../components/RequirementForm.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { useData } from '../context/DataContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { REQ_TYPES } from '../utils/constants.js';
import { formatDate } from '../utils/format.js';

export default function RequirementDetailPage({ id, navigate }) {
  const { requirements, testCases, saveRequirement, deleteRequirement } = useData();
  const { user, can } = useAuth();
  const { notify } = useToast();
  const [edit, setEdit] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const req = requirements.find(r => r.id === id);

  if (!req) {
    return <EmptyState icon="alert" title="Вимогу не знайдено" text={`Запис ${id} відсутній або був видалений.`}
      action={<a className="btn btn--ghost" href="#/requirements">До списку вимог</a>} />;
  }

  const linked = testCases.filter(tc => tc.requirementIds.includes(req.id));

  return (
    <>
      <PageHeader
        back={<a href="#/requirements" className="back"><Icon name="arrowLeft" size={16} /> Вимоги</a>}
        title={<><code>{req.id}</code> {req.title}</>}
        actions={can('req:edit') && <>
          <button className="btn btn--ghost" onClick={() => setEdit(true)}><Icon name="edit" /> Редагувати</button>
          <button className="btn btn--danger-ghost" onClick={() => setConfirm(true)}><Icon name="trash" /> Видалити</button>
        </>} />

      <div className="grid-detail">
        <section className="card">
          <h2>Опис</h2>
          <p className="prewrap">{req.description}</p>
          <dl className="meta">
            <div><dt>Тип</dt><dd>{REQ_TYPES[req.type]}</dd></div>
            <div><dt>Пріоритет</dt><dd><Badge kind="priority" value={req.priority} /></dd></div>
            <div><dt>Статус</dt><dd><Badge kind="req" value={req.status} /></dd></div>
            <div><dt>Автор</dt><dd>{req.author}</dd></div>
            <div><dt>Змінено</dt><dd>{formatDate(req.updatedAt)}</dd></div>
          </dl>
        </section>
        <section className="card">
          <h2>Тест-кейси ({linked.length})</h2>
          {linked.length === 0 ? (
            <p className="muted">Вимога не покрита тестами.</p>
          ) : (
            <ul className="list">
              {linked.map(tc => (
                <li key={tc.id}>
                  <a href={`#/tests/${tc.id}`}><code>{tc.id}</code> {tc.title}</a>
                  <Badge kind="tc" value={tc.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {edit && <RequirementForm initial={req} onClose={() => setEdit(false)}
        onSave={async d => { await saveRequirement(d, user.name); notify(`Вимогу ${req.id} оновлено`); }} />}
      {confirm && <ConfirmDialog title={`Видалити ${req.id}?`} onClose={() => setConfirm(false)}
        text={`Вимогу буде видалено, а звʼязки з ${linked.length} тест-кейсами - розірвано. Дію неможливо скасувати.`}
        onConfirm={async () => { await deleteRequirement(req.id); notify(`Вимогу ${req.id} видалено`); navigate('/requirements'); }} />}
    </>
  );
}
