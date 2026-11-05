import { useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import Toolbar from '../components/Toolbar.jsx';
import Badge from '../components/Badge.jsx';
import Icon from '../components/Icon.jsx';
import EmptyState from '../components/EmptyState.jsx';
import RequirementForm from '../components/RequirementForm.jsx';
import { useData } from '../context/DataContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDebounce } from '../hooks/useDebounce.js';
import { filterItems, sortItems } from '../utils/filter.js';
import { requirementHealth } from '../utils/metrics.js';
import { REQ_STATUSES, REQ_TYPES } from '../utils/constants.js';

const HEALTH = { uncovered: 'Без тестів', failed: 'Є провалені', blocked: 'Заблоковано', passed: 'Пройдено', pending: 'В процесі' };

export default function RequirementsPage() {
  const { requirements, testCases, saveRequirement } = useData();
  const { user, can } = useAuth();
  const { notify } = useToast();
  const [filters, setFilters] = useState({ query: '', priority: 'all', status: 'all', sort: 'id' });
  const [editing, setEditing] = useState(null);
  const query = useDebounce(filters.query);

  const list = useMemo(
    () => sortItems(filterItems(requirements, { ...filters, query }), filters.sort),
    [requirements, filters, query]
  );

  const save = async data => {
    const saved = await saveRequirement(data, user.name);
    notify(data.id ? `Вимогу ${saved.id} оновлено` : `Створено вимогу ${saved.id}`);
  };

  return (
    <>
      <PageHeader title="Вимоги" subtitle={`Показано ${list.length} з ${requirements.length}`}
        actions={can('req:edit') && (
          <button className="btn btn--primary" onClick={() => setEditing({})}><Icon name="plus" /> Нова вимога</button>
        )} />
      <Toolbar filters={filters} onChange={setFilters} statuses={REQ_STATUSES} />

      {list.length === 0 ? (
        <EmptyState title="Нічого не знайдено" text="Змініть параметри пошуку або фільтри." />
      ) : (
        <div className="table-wrap">
          <table className="table table--cards">
            <thead>
              <tr><th scope="col">ID</th><th scope="col">Назва</th><th scope="col">Тип</th><th scope="col">Пріоритет</th><th scope="col">Статус</th><th scope="col">Тести</th><th scope="col"><span className="sr-only">Дії</span></th></tr>
            </thead>
            <tbody>
              {list.map(r => {
                const h = requirementHealth(r.id, testCases);
                const n = testCases.filter(tc => tc.requirementIds.includes(r.id)).length;
                return (
                  <tr key={r.id}>
                    <td data-label="ID"><code>{r.id}</code></td>
                    <td data-label="Назва" className="cell-title"><a href={`#/requirements/${r.id}`}>{r.title}</a></td>
                    <td data-label="Тип">{REQ_TYPES[r.type]}</td>
                    <td data-label="Пріоритет"><Badge kind="priority" value={r.priority} /></td>
                    <td data-label="Статус"><Badge kind="req" value={r.status} /></td>
                    <td data-label="Тести"><span className={`health health--${h}`}>{n} · {HEALTH[h]}</span></td>
                    <td className="cell-actions">
                      {can('req:edit') && (
                        <button className="icon-btn" onClick={() => setEditing(r)} aria-label={`Редагувати ${r.id}`}><Icon name="edit" /></button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && <RequirementForm initial={editing} onSave={save} onClose={() => setEditing(null)} />}
    </>
  );
}
