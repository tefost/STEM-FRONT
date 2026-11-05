import { storage } from './storage.js';
import { seedRequirements, seedTestCases } from './seed.js';

const DATA_KEY = 'data.v1';
const LATENCY = 350;

const wait = (ms = LATENCY) => new Promise(r => setTimeout(r, ms));

function load() {
  const data = storage.get(DATA_KEY);
  if (data && Array.isArray(data.requirements) && Array.isArray(data.testCases)) return data;
  const seeded = { requirements: seedRequirements, testCases: seedTestCases };
  storage.set(DATA_KEY, seeded);
  return seeded;
}

function save(data) {
  if (!storage.set(DATA_KEY, data)) throw new Error('Не вдалося зберегти дані: сховище недоступне');
  return data;
}

export const api = {
  async fetchAll() {
    await wait();
    return load();
  },
  async saveAll(data) {
    await wait();
    return save(data);
  },
  async reset() {
    await wait();
    storage.remove(DATA_KEY);
    return load();
  }
};
