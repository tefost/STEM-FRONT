import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isEmail, passwordScore, validateLogin, validateRegister, validateRequirement, validateTestCase, hasErrors } from '../src/utils/validation.js';

test('isEmail', () => {
  assert.equal(isEmail('qa@reqtrace.dev'), true);
  assert.equal(isEmail('bad@'), false);
  assert.equal(isEmail('no spaces@a.com'), false);
});

test('passwordScore', () => {
  assert.equal(passwordScore('abc'), 0);
  assert.ok(passwordScore('Analyst#2026') >= 3);
});

test('validateLogin', () => {
  assert.deepEqual(Object.keys(validateLogin({ email: '', password: '' })).sort(), ['email', 'password']);
  assert.equal(hasErrors(validateLogin({ email: 'a@b.ua', password: 'x' })), false);
});

test('validateRegister', () => {
  const ok = { name: 'Іван', email: 'i@b.ua', password: 'Strong#Pass1', confirm: 'Strong#Pass1', role: 'tester' };
  assert.equal(hasErrors(validateRegister(ok)), false);
  assert.ok(validateRegister({ ...ok, confirm: 'other' }).confirm);
  assert.ok(validateRegister({ ...ok, password: 'aaaaaaaa', confirm: 'aaaaaaaa' }).password);
  assert.ok(validateRegister({ ...ok, role: 'admin' }).role);
});

test('validateRequirement', () => {
  const ok = { title: 'Пошук номерів', description: 'Опис достатньої довжини', type: 'functional', priority: 'high', status: 'draft' };
  assert.equal(hasErrors(validateRequirement(ok)), false);
  assert.ok(validateRequirement({ ...ok, title: 'abc' }).title);
  assert.ok(validateRequirement({ ...ok, priority: 'urgent' }).priority);
  assert.ok(validateRequirement({ ...ok, title: 'x'.repeat(200) }).title);
});

test('validateTestCase', () => {
  const ok = { title: 'Вхід у систему', priority: 'low', requirementIds: ['REQ-001'], steps: [{ action: 'a', expected: 'b' }] };
  assert.equal(hasErrors(validateTestCase(ok)), false);
  assert.ok(validateTestCase({ ...ok, requirementIds: [] }).requirementIds);
  assert.ok(validateTestCase({ ...ok, steps: [] }).steps);
  assert.ok(validateTestCase({ ...ok, steps: [{ action: 'a', expected: ' ' }] }).steps);
});
