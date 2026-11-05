import { useRef, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import Icon from '../components/Icon.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { useData } from '../context/DataContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { requirementsToCsv, testCasesToCsv, downloadFile, parseBackup } from '../utils/export.js';
import { coverage, passRate } from '../utils/metrics.js';

const MAX_SIZE = 1024 * 1024;

export default function ReportsPage() {
  const { requirements, testCases, importData, resetDemo } = useData();
  const { notify } = useToast();
  const fileRef = useRef(null);
  const [confirm, setConfirm] = useState(false);
  const stamp = new Date().toISOString().slice(0, 10);

  const onImport = async e => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_SIZE) return notify('Файл перевищує 1 МБ', 'error');
    if (!/\.json$/i.test(file.name)) return notify('Підтримується лише формат JSON', 'error');
    try {
      const data = parseBackup(await file.text());
      await importData(data);
      notify(`Імпортовано: ${data.requirements.length} вимог, ${data.testCases.length} тест-кейсів`);
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  return (
    <>
      <PageHeader title="Звіти та експорт" subtitle="Вивантаження даних для звітності та резервного копіювання" />
      <div className="cards-3">
        <section className="card">
          <h2>Реєстр вимог</h2>
          <p className="muted">{requirements.length} записів у форматі CSV для Excel.</p>
          <button className="btn btn--ghost" onClick={() => downloadFile(`requirements-${stamp}.csv`, requirementsToCsv(requirements), 'text/csv;charset=utf-8')}>
            <Icon name="download" /> Завантажити CSV
          </button>
        </section>
        <section className="card">
          <h2>Звіт з тестування</h2>
          <p className="muted">Покриття {coverage(requirements, testCases)}%, успішність {passRate(testCases)}%.</p>
          <button className="btn btn--ghost" onClick={() => downloadFile(`test-report-${stamp}.csv`, testCasesToCsv(testCases), 'text/csv;charset=utf-8')}>
            <Icon name="download" /> Завантажити CSV
          </button>
        </section>
        <section className="card">
          <h2>Резервна копія</h2>
          <p className="muted">Повний стан проєкту у форматі JSON.</p>
          <div className="btn-row">
            <button className="btn btn--ghost" onClick={() => downloadFile(`reqtrace-backup-${stamp}.json`, JSON.stringify({ requirements, testCases }, null, 2), 'application/json')}>
              <Icon name="download" /> Експорт
            </button>
            <button className="btn btn--ghost" onClick={() => fileRef.current?.click()}><Icon name="upload" /> Імпорт</button>
            <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={onImport} />
          </div>
        </section>
      </div>
      <section className="card card--danger">
        <h2>Демонстраційні дані</h2>
        <p className="muted">Повернути початковий набір вимог і тест-кейсів.</p>
        <button className="btn btn--danger-ghost" onClick={() => setConfirm(true)}><Icon name="refresh" /> Скинути дані</button>
      </section>
      {confirm && <ConfirmDialog title="Скинути дані?" confirmLabel="Скинути" onClose={() => setConfirm(false)}
        text="Усі зміни буде втрачено, буде відновлено демонстраційний набір."
        onConfirm={async () => { await resetDemo(); notify('Дані відновлено'); }} />}
    </>
  );
}
