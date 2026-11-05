import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanText, cleanLine, safeCsvCell } from '../src/utils/sanitize.js';
import { parseBackup, requirementsToCsv } from '../src/utils/export.js';

test('cleanText strips control chars and limits length', () => {
  assert.equal(cleanText('  a\u0000b\u0007  '), 'ab');
  assert.equal(cleanText('x'.repeat(50), 10).length, 10);
  assert.equal(cleanText(null), '');
  assert.equal(cleanLine('a   \n  b'), 'a b');
});

test('csv formula injection is neutralised', () => {
  assert.equal(safeCsvCell('=HYPERLINK("x")'), '"\'=HYPERLINK(""x"")"');
  assert.equal(safeCsvCell('+1'), "'+1");
  assert.equal(safeCsvCell('a;b'), '"a;b"');
  assert.equal(safeCsvCell('plain'), 'plain');
});

test('csv export has header and rows', () => {
  const csv = requirementsToCsv([{ id: 'REQ-001', title: 'T', type: 'functional', priority: 'high', status: 'draft', description: 'D' }]);
  const lines = csv.split('\r\n');
  assert.equal(lines.length, 2);
  assert.ok(lines[1].startsWith('REQ-001;T;'));
});

test('parseBackup validates structure', () => {
  assert.throws(() => parseBackup('not json'), /JSON/);
  assert.throws(() => parseBackup('{"a":1}'));
  assert.throws(() => parseBackup('{"requirements":[{"id":1}],"testCases":[]}'));
  const ok = parseBackup('{"requirements":[{"id":"REQ-001","title":"t"}],"testCases":[{"id":"TC-001","steps":[],"requirementIds":[]}]}');
  assert.equal(ok.requirements.length, 1);
});
