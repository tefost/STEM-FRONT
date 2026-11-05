import PageHeader from '../components/PageHeader.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import Badge from '../components/Badge.jsx';
import { useData } from '../context/DataContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { coverage, countBy, passRate, requirementHealth } from '../utils/metrics.js';
import { REQ_STATUSES, TC_STATUSES } from '../utils/constants.js';
import { formatDate } from '../utils/format.js';

export default function DashboardPage() {
  const { requirements, testCases } = useData();
  const { user } = useAuth();
  const cov = coverage(requirements, testCases);
  const rate = passRate(testCases);
  const tcCounts = countBy(testCases, 'status');
  const reqCounts = countBy(requirements, 'status');
  const risky = requirements.filter(r => ['failed', 'uncovered', 'blocked'].includes(requirementHealth(r.id, testCases)));
  const recent = testCases.flatMap(tc => tc.history.map(h => ({ ...h, id: tc.id, title: tc.title })))
    .sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <>
      <PageHeader title={`Вітаємо, ${user.name.split(' ')[0]}!`} subtitle="Стан якості проєкту на поточний момент" />

      <section className="stats" aria-label="Ключові показники">
        <a className="stat" href="#/requirements"><span className="stat__label">Вимог</span><strong className="stat__value">{requirements.length}</strong></a>
        <a className="stat" href="#/tests"><span className="stat__label">Тест-кейсів</span><strong className="stat__value">{testCases.length}</strong></a>
        <div className="stat"><span className="stat__label">Покриття тестами</span><strong className="stat__value">{cov}%</strong><ProgressBar value={cov} label="Покриття" /></div>
        <div className="stat"><span className="stat__label">Успішність прогонів</span><strong className="stat__value">{rate}%</strong><ProgressBar value={rate} label="Успішність" tone="success" /></div>
      </section>

      <div className="grid-2">
        <section className="card">
          <h2>Результати тестування</h2>
          <ul className="bars">
            {Object.entries(TC_STATUSES).map(([k, label]) => {
              const n = tcCounts[k] || 0;
              const pct = testCases.length ? Math.round((n / testCases.length) * 100) : 0;
              return (
                <li key={k}>
                  <span className="bars__label">{label}</span>
                  <span className="bars__track"><span className={`bars__fill bar--${k}`} style={{ width: `${pct}%` }} /></span>
                  <span className="bars__val">{n}</span>
                </li>
              );
            })}
          </ul>
        </section>
        <section className="card">
          <h2>Вимоги за статусом</h2>
          <ul className="bars">
            {Object.entries(REQ_STATUSES).map(([k, label]) => {
              const n = reqCounts[k] || 0;
              const pct = requirements.length ? Math.round((n / requirements.length) * 100) : 0;
              return (
                <li key={k}>
                  <span className="bars__label">{label}</span>
                  <span className="bars__track"><span className="bars__fill bar--req" style={{ width: `${pct}%` }} /></span>
                  <span className="bars__val">{n}</span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="grid-2">
        <section className="card">
          <h2>Потребують уваги</h2>
          {risky.length === 0 ? <p className="muted">Ризикових вимог немає.</p> : (
            <ul className="list">
              {risky.map(r => {
                const h = requirementHealth(r.id, testCases);
                return (
                  <li key={r.id}>
                    <a href={`#/requirements/${r.id}`}><code>{r.id}</code> {r.title}</a>
                    <span className={`health health--${h}`}>{h === 'uncovered' ? 'Без тестів' : h === 'failed' ? 'Є провалені' : 'Заблоковано'}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <section className="card">
          <h2>Останні прогони</h2>
          {recent.length === 0 ? <p className="muted">Прогонів ще не було.</p> : (
            <ul className="list">
              {recent.map((h, i) => (
                <li key={i}>
                  <a href={`#/tests/${h.id}`}><code>{h.id}</code> {h.title}</a>
                  <span className="list__meta"><Badge kind="tc" value={h.status} /> <small className="muted">{formatDate(h.date)}</small></span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
