export function coverage(requirements, testCases) {
  if (!requirements.length) return 0;
  const covered = new Set(testCases.flatMap(tc => tc.requirementIds));
  const n = requirements.filter(r => covered.has(r.id)).length;
  return Math.round((n / requirements.length) * 100);
}

export function countBy(list, key) {
  return list.reduce((acc, item) => {
    acc[item[key]] = (acc[item[key]] || 0) + 1;
    return acc;
  }, {});
}

export function passRate(testCases) {
  const run = testCases.filter(tc => tc.status !== 'not_run');
  if (!run.length) return 0;
  return Math.round((run.filter(tc => tc.status === 'passed').length / run.length) * 100);
}

export function requirementHealth(reqId, testCases) {
  const linked = testCases.filter(tc => tc.requirementIds.includes(reqId));
  if (!linked.length) return 'uncovered';
  if (linked.some(tc => tc.status === 'failed')) return 'failed';
  if (linked.some(tc => tc.status === 'blocked')) return 'blocked';
  if (linked.every(tc => tc.status === 'passed')) return 'passed';
  return 'pending';
}

export function buildMatrix(requirements, testCases) {
  return requirements.map(r => ({
    requirement: r,
    cells: testCases.map(tc => (tc.requirementIds.includes(r.id) ? tc.status : null)),
    health: requirementHealth(r.id, testCases)
  }));
}

export function nextId(prefix, list) {
  const max = list.reduce((m, item) => {
    const n = parseInt(String(item.id).replace(prefix + '-', ''), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
}
