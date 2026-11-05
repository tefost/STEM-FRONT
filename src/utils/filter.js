const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export function filterItems(list, { query = '', priority = 'all', status = 'all' } = {}) {
  const q = query.trim().toLowerCase();
  return list.filter(item => {
    if (priority !== 'all' && item.priority !== priority) return false;
    if (status !== 'all' && item.status !== status) return false;
    if (!q) return true;
    return [item.id, item.title, item.description]
      .filter(Boolean)
      .some(v => v.toLowerCase().includes(q));
  });
}

export function sortItems(list, sort = 'id') {
  const copy = [...list];
  if (sort === 'priority') copy.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  else if (sort === 'updated') copy.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  else if (sort === 'title') copy.sort((a, b) => a.title.localeCompare(b.title, 'uk'));
  else copy.sort((a, b) => a.id.localeCompare(b.id));
  return copy;
}
