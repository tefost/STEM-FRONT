import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coverage, passRate, requirementHealth, buildMatrix, nextId, countBy } from '../src/utils/metrics.js';
import { filterItems, sortItems } from '../src/utils/filter.js';

const reqs = [
  { id: 'REQ-001', title: 'Вхід', priority: 'high', status: 'approved' },
  { id: 'REQ-002', title: 'Пошук', priority: 'low', status: 'draft' },
  { id: 'REQ-003', title: 'Оплата', priority: 'medium', status: 'draft' }
];
const tcs = [
  { id: 'TC-001', requirementIds: ['REQ-001'], status: 'passed' },
  { id: 'TC-002', requirementIds: ['REQ-001', 'REQ-002'], status: 'failed' },
  { id: 'TC-003', requirementIds: ['REQ-002'], status: 'not_run' }
];

test('coverage', () => {
  assert.equal(coverage(reqs, tcs), 67);
  assert.equal(coverage([], tcs), 0);
});

test('passRate ignores not_run', () => {
  assert.equal(passRate(tcs), 50);
  assert.equal(passRate([]), 0);
});

test('requirementHealth', () => {
  assert.equal(requirementHealth('REQ-003', tcs), 'uncovered');
  assert.equal(requirementHealth('REQ-001', tcs), 'failed');
  assert.equal(requirementHealth('REQ-001', [tcs[0]]), 'passed');
  assert.equal(requirementHealth('REQ-002', [tcs[2]]), 'pending');
});

test('buildMatrix', () => {
  const m = buildMatrix(reqs, tcs);
  assert.equal(m.length, 3);
  assert.deepEqual(m[1].cells, [null, 'failed', 'not_run']);
});

test('nextId', () => {
  assert.equal(nextId('REQ', reqs), 'REQ-004');
  assert.equal(nextId('TC', []), 'TC-001');
});

test('countBy', () => {
  assert.deepEqual(countBy(reqs, 'status'), { approved: 1, draft: 2 });
});

test('filter and sort', () => {
  assert.equal(filterItems(reqs, { query: 'пош' }).length, 1);
  assert.equal(filterItems(reqs, { status: 'draft' }).length, 2);
  assert.equal(filterItems(reqs, { priority: 'high', status: 'draft' }).length, 0);
  assert.deepEqual(sortItems(reqs, 'priority').map(r => r.id), ['REQ-001', 'REQ-003', 'REQ-002']);
});
