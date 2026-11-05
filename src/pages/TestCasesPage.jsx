import { useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import Toolbar from '../components/Toolbar.jsx';
import Badge from '../components/Badge.jsx';
import Icon from '../components/Icon.jsx';
import EmptyState from '../components/EmptyState.jsx';
import TestCaseForm from '../components/TestCaseForm.jsx';
import { useData } from '../context/DataContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDebounce } from '../hooks/useDebounce.js';
import { filterItems, sortItems } from '../utils/filter.js';
import { TC_STATUSES } from '../utils/constants.js';
import { formatDate } from '../utils/format.js';

export default function TestCasesPage({ query: params }) {
  const { requirements, testCases, saveTestCase } = useData();
  const { can } = useAuth();
  const { notify } = useToast();
  const [filters, setFilters] = useState({ query: '', priority: 'all', status: params?.get('status') || 'all', sort: 'id' });
  const [editing, setEditing] = useState(null);
  const query = useDebounce(filters.query);

  const list = useMemo(
    () => sortItems(filterItems(testCases, { ...filters, query }), filters.sort),
    [testCases, filters, query]
  );

  const save = async data => {
    const saved = await saveTestCase(data);
    notify(data.id ? `Тест-кейс ${saved.id} оновлено` : `Створено тест-кейс ${saved.id}`);
  };

  return (
    <>
      <PageHeader title="Тест-кейси" subtitle={`Показано ${list.length} з ${testCases.length}`}
        actions={can('tc:edit') && (
          <button className="btn btn--primary" onClick={() => setEditing({})}><Icon name="plus" /> Новий тест-кейс</button>
        )} />
      <Toolbar filters={filters} onChange={setFilters} statuses={TC_STATUSES} statusLabel="Результат" />

      {list.length === 0 ? (
        <EmptyState title="Тест-кейсів не знайдено" text="Змініть параметри пошуку або створіть новий тест-кейс." />
      ) : (
        <div className="table-wrap">
          <table className="table table--cards">
            <thead>
              <tr><th scope="col">ID</th><th scope="col">Назва</th><th scope="col">Вимоги</th><th scope="col">Пріоритет</th><th scope="col">Результат</th><th scope="col">Останній прогін</th><th scope="col"><span className="sr-only">Дії</span></th></tr>
            </thead>
            <tbody>
              {list.map(tc => (
                <tr key={tc.id}>
                  <td data-label="ID"><code>{tc.id}</code></td>
                  <td data-label="Назва" className="cell-title"><a href={`#/tests/${tc.id}`}>{tc.title}</a></td>
                  <td data-label="Вимоги">
                    <span className="tags">{tc.requirementIds.map(id => <a key={id} className="tag" href={`#/requirements/${id}`}>{id}</a>)}</span>
                  </td>
                  <td data-label="Пріоритет"><Badge kind="priority" value={tc.priority} /></td>
                  <td data-label="Результат"><Badge kind="tc" value={tc.status} /></td>
                  <td data-label="Прогін"><small>{formatDate(tc.lastRunAt)}</small></td>
                  <td className="cell-actions">
                    {can('tc:edit') && (
                      <button className="icon-btn" onClick={() => setEditing(tc)} aria-label={`Редагувати ${tc.id}`}><Icon name="edit" /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && <TestCaseForm initial={editing} requirements={requirements} onSave={save} onClose={() => setEditing(null)} />}
    </>
  );
}
