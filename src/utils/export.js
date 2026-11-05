import { safeCsvCell } from './sanitize.js';
import { PRIORITIES, REQ_STATUSES, REQ_TYPES, TC_STATUSES } from './constants.js';

export function requirementsToCsv(requirements) {
  const head = ['ID', 'Назва', 'Тип', 'Пріоритет', 'Статус', 'Опис'];
  const rows = requirements.map(r => [
    r.id, r.title, REQ_TYPES[r.type], PRIORITIES[r.priority], REQ_STATUSES[r.status], r.description
  ]);
  return [head, ...rows].map(row => row.map(safeCsvCell).join(';')).join('\r\n');
}

export function testCasesToCsv(testCases) {
  const head = ['ID', 'Назва', 'Пріоритет', 'Статус', 'Вимоги', 'Кроків', 'Останній прогін'];
  const rows = testCases.map(tc => [
    tc.id, tc.title, PRIORITIES[tc.priority], TC_STATUSES[tc.status],
    tc.requirementIds.join(', '), tc.steps.length, tc.lastRunAt || ''
  ]);
  return [head, ...rows].map(row => row.map(safeCsvCell).join(';')).join('\r\n');
}

export function parseBackup(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Файл не є коректним JSON');
  }
  if (!data || !Array.isArray(data.requirements) || !Array.isArray(data.testCases)) {
    throw new Error('У файлі немає розділів requirements і testCases');
  }
  const okReq = data.requirements.every(r => typeof r.id === 'string' && typeof r.title === 'string');
  const okTc = data.testCases.every(t => typeof t.id === 'string' && Array.isArray(t.steps) && Array.isArray(t.requirementIds));
  if (!okReq || !okTc) throw new Error('Структура записів не відповідає формату');
  return { requirements: data.requirements, testCases: data.testCases };
}

export function downloadFile(name, content, type) {
  const bom = type.startsWith('text/csv') ? '﻿' : '';
  const blob = new Blob([bom + content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
