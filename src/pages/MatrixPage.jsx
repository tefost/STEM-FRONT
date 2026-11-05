import { useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { useData } from '../context/DataContext.jsx';
import { buildMatrix, coverage } from '../utils/metrics.js';
import { TC_STATUSES } from '../utils/constants.js';

const SYMBOL = { passed: '✓', failed: '✕', blocked: '!', not_run: '○' };
const HEALTH = { uncovered: 'Без тестів', failed: 'Є провалені', blocked: 'Заблоковано', passed: 'Пройдено', pending: 'В процесі' };

export default function MatrixPage() {
  const { requirements, testCases } = useData();
  const [onlyGaps, setOnlyGaps] = useState(false);
  const rows = useMemo(() => buildMatrix(requirements, testCases), [requirements, testCases]);
  const shown = onlyGaps ? rows.filter(r => r.health !== 'passed') : rows;

  return (
    <>
      <PageHeader title="Матриця трасування" subtitle={`Покриття вимог тестами: ${coverage(requirements, testCases)}%`}
        actions={<label className="switch">
          <input type="checkbox" checked={onlyGaps} onChange={e => setOnlyGaps(e.target.checked)} />
          <span>Лише проблемні</span>
        </label>} />

      <ul className="legend" aria-label="Умовні позначення">
        {Object.entries(TC_STATUSES).map(([k, v]) => (
          <li key={k}><span className={`cell cell--${k}`} aria-hidden="true">{SYMBOL[k]}</span>{v}</li>
        ))}
      </ul>

      <div className="matrix-wrap" tabIndex={0} role="region" aria-label="Матриця трасування, прокручується горизонтально">
        <table className="matrix">
          <thead>
            <tr>
              <th scope="col" className="matrix__sticky">Вимога</th>
              {testCases.map(tc => (
                <th key={tc.id} scope="col" className="matrix__tc">
                  <a href={`#/tests/${tc.id}`} title={tc.title}>{tc.id}</a>
                </th>
              ))}
              <th scope="col">Стан</th>
            </tr>
          </thead>
          <tbody>
            {shown.map(row => (
              <tr key={row.requirement.id}>
                <th scope="row" className="matrix__sticky">
                  <a href={`#/requirements/${row.requirement.id}`} title={row.requirement.title}>{row.requirement.id}</a>
                  <span className="matrix__name">{row.requirement.title}</span>
                </th>
                {row.cells.map((st, i) => (
                  <td key={testCases[i].id}>
                    {st && <span className={`cell cell--${st}`} title={`${testCases[i].id}: ${TC_STATUSES[st]}`}>
                      {SYMBOL[st]}<span className="sr-only">{TC_STATUSES[st]}</span>
                    </span>}
                  </td>
                ))}
                <td><span className={`health health--${row.health}`}>{HEALTH[row.health]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
