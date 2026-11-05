import { LIMITS, PRIORITIES, REQ_STATUSES, REQ_TYPES } from './constants.js';

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i;

export function isEmail(value) {
  return typeof value === 'string' && EMAIL.test(value.trim());
}

export function passwordScore(pw = '') {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-zа-яіїєґ]/.test(pw) && /[A-ZА-ЯІЇЄҐ]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-zА-Яа-яІіЇїЄєҐґ0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

export function validateLogin({ email, password }) {
  const e = {};
  if (!email) e.email = 'Вкажіть e-mail';
  else if (!isEmail(email)) e.email = 'Некоректний формат e-mail';
  if (!password) e.password = 'Вкажіть пароль';
  return e;
}

export function validateRegister({ name, email, password, confirm, role }) {
  const e = {};
  if (!name || name.trim().length < 2) e.name = 'Мінімум 2 символи';
  else if (name.length > LIMITS.name) e.name = `Максимум ${LIMITS.name} символів`;
  if (!isEmail(email)) e.email = 'Некоректний формат e-mail';
  if (!password || password.length < 8) e.password = 'Мінімум 8 символів';
  else if (passwordScore(password) < 3) e.password = 'Додайте великі літери, цифри або спецсимволи';
  if (confirm !== password) e.confirm = 'Паролі не збігаються';
  if (!['analyst', 'tester'].includes(role)) e.role = 'Оберіть роль';
  return e;
}

export function validateRequirement(r) {
  const e = {};
  const title = (r.title || '').trim();
  if (title.length < 5) e.title = 'Назва має містити щонайменше 5 символів';
  else if (title.length > LIMITS.title) e.title = `Максимум ${LIMITS.title} символів`;
  if ((r.description || '').trim().length < 10) e.description = 'Опишіть вимогу (мінімум 10 символів)';
  else if (r.description.length > LIMITS.text) e.description = `Максимум ${LIMITS.text} символів`;
  if (!(r.priority in PRIORITIES)) e.priority = 'Оберіть пріоритет';
  if (!(r.type in REQ_TYPES)) e.type = 'Оберіть тип';
  if (!(r.status in REQ_STATUSES)) e.status = 'Оберіть статус';
  return e;
}

export function validateTestCase(tc) {
  const e = {};
  const title = (tc.title || '').trim();
  if (title.length < 5) e.title = 'Назва має містити щонайменше 5 символів';
  else if (title.length > LIMITS.title) e.title = `Максимум ${LIMITS.title} символів`;
  if (!(tc.priority in PRIORITIES)) e.priority = 'Оберіть пріоритет';
  if (!Array.isArray(tc.requirementIds) || tc.requirementIds.length === 0) {
    e.requirementIds = 'Привʼяжіть тест-кейс хоча б до однієї вимоги';
  }
  const steps = Array.isArray(tc.steps) ? tc.steps : [];
  if (steps.length === 0) e.steps = 'Додайте хоча б один крок';
  else if (steps.length > LIMITS.steps) e.steps = `Максимум ${LIMITS.steps} кроків`;
  else if (steps.some(s => !s.action?.trim() || !s.expected?.trim())) {
    e.steps = 'Кожен крок має містити дію та очікуваний результат';
  }
  return e;
}

export const hasErrors = errors => Object.keys(errors).length > 0;
