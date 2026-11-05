import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { api } from '../services/api.js';
import { nextId } from '../utils/metrics.js';

const DataContext = createContext(null);

const initial = { status: 'loading', error: null, requirements: [], testCases: [] };

function reducer(state, action) {
  switch (action.type) {
    case 'loading':
      return { ...state, status: 'loading', error: null };
    case 'loaded':
      return { status: 'ready', error: null, ...action.data };
    case 'error':
      return { ...state, status: 'error', error: action.error };
    default:
      return state;
  }
}

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);

  const load = useCallback(async () => {
    dispatch({ type: 'loading' });
    try {
      dispatch({ type: 'loaded', data: await api.fetchAll() });
    } catch (e) {
      dispatch({ type: 'error', error: e.message });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const persist = useCallback(async data => {
    const saved = await api.saveAll(data);
    dispatch({ type: 'loaded', data: saved });
    return saved;
  }, []);

  const actions = useMemo(() => {
    const stamp = () => new Date().toISOString();
    const snapshot = () => ({ requirements: state.requirements, testCases: state.testCases });

    return {
      reload: load,

      async saveRequirement(req, author) {
        const d = snapshot();
        if (req.id) {
          d.requirements = d.requirements.map(r => (r.id === req.id ? { ...r, ...req, updatedAt: stamp() } : r));
        } else {
          const created = { ...req, id: nextId('REQ', d.requirements), createdAt: stamp(), updatedAt: stamp(), author };
          d.requirements = [...d.requirements, created];
          req = created;
        }
        await persist(d);
        return req;
      },

      async deleteRequirement(id) {
        const d = snapshot();
        d.requirements = d.requirements.filter(r => r.id !== id);
        d.testCases = d.testCases.map(tc => ({ ...tc, requirementIds: tc.requirementIds.filter(x => x !== id) }));
        await persist(d);
      },

      async saveTestCase(tc) {
        const d = snapshot();
        if (tc.id) {
          d.testCases = d.testCases.map(t => (t.id === tc.id ? { ...t, ...tc, updatedAt: stamp() } : t));
        } else {
          const created = { ...tc, id: nextId('TC', d.testCases), status: 'not_run', lastRunAt: null, history: [], createdAt: stamp(), updatedAt: stamp() };
          d.testCases = [...d.testCases, created];
          tc = created;
        }
        await persist(d);
        return tc;
      },

      async deleteTestCase(id) {
        const d = snapshot();
        d.testCases = d.testCases.filter(t => t.id !== id);
        await persist(d);
      },

      async runTestCase(id, status, comment, by) {
        const d = snapshot();
        const date = stamp();
        d.testCases = d.testCases.map(t => (t.id === id
          ? { ...t, status, lastRunAt: date, history: [{ date, status, comment, by }, ...t.history].slice(0, 50) }
          : t));
        await persist(d);
      },

      async importData(data) {
        await persist(data);
      },

      async resetDemo() {
        dispatch({ type: 'loaded', data: await api.reset() });
      }
    };
  }, [state.requirements, state.testCases, load, persist]);

  const value = useMemo(() => ({ ...state, ...actions }), [state, actions]);
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => useContext(DataContext);
