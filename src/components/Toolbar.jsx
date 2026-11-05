import Icon from './Icon.jsx';
import { PRIORITIES } from '../utils/constants.js';

export default function Toolbar({ filters, onChange, statuses, statusLabel = 'Статус' }) {
  const set = (k, v) => onChange({ ...filters, [k]: v });
  return (
    <div className="toolbar" role="search">
      <div className="search">
        <Icon name="search" />
        <input type="search" placeholder="Пошук за ID, назвою або описом" value={filters.query}
          onChange={e => set('query', e.target.value)} aria-label="Пошук" maxLength={100} />
      </div>
      <select value={filters.priority} onChange={e => set('priority', e.target.value)} aria-label="Пріоритет">
        <option value="all">Усі пріоритети</option>
        {Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      <select value={filters.status} onChange={e => set('status', e.target.value)} aria-label={statusLabel}>
        <option value="all">Усі статуси</option>
        {Object.entries(statuses).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      <select value={filters.sort} onChange={e => set('sort', e.target.value)} aria-label="Сортування">
        <option value="id">За ID</option>
        <option value="priority">За пріоритетом</option>
        <option value="title">За назвою</option>
        <option value="updated">Нещодавно змінені</option>
      </select>
    </div>
  );
}
