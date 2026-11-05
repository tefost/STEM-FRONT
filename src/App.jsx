import { useEffect } from 'react';
import { useHashRoute, matchRoute } from './hooks/useHashRoute.js';
import { useTheme } from './hooks/useTheme.js';
import { useAuth } from './context/AuthContext.jsx';
import { DataProvider, useData } from './context/DataContext.jsx';
import Layout from './components/Layout.jsx';
import Loader from './components/Loader.jsx';
import EmptyState from './components/EmptyState.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import RequirementsPage from './pages/RequirementsPage.jsx';
import RequirementDetailPage from './pages/RequirementDetailPage.jsx';
import TestCasesPage from './pages/TestCasesPage.jsx';
import TestCaseDetailPage from './pages/TestCaseDetailPage.jsx';
import MatrixPage from './pages/MatrixPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

const ROUTES = [
  ['/dashboard', DashboardPage, 'Огляд'],
  ['/requirements', RequirementsPage, 'Вимоги'],
  ['/requirements/:id', RequirementDetailPage, 'Вимога'],
  ['/tests', TestCasesPage, 'Тест-кейси'],
  ['/tests/:id', TestCaseDetailPage, 'Тест-кейс'],
  ['/matrix', MatrixPage, 'Матриця трасування'],
  ['/reports', ReportsPage, 'Звіти']
];

function Protected({ path, query, navigate }) {
  const { status, error, reload } = useData();
  let Page = NotFoundPage;
  let params = {};
  let title = 'Не знайдено';
  for (const [pattern, Comp, t] of ROUTES) {
    const m = matchRoute(pattern, path);
    if (m) {
      Page = Comp;
      params = m;
      title = t;
      break;
    }
  }

  useEffect(() => {
    document.title = `${title} · ReqTrace`;
  }, [title]);

  if (status === 'loading') return <Loader />;
  if (status === 'error') {
    return <EmptyState icon="alert" title="Не вдалося завантажити дані" text={error}
      action={<button className="btn btn--primary" onClick={reload}>Спробувати знову</button>} />;
  }
  return <Page {...params} query={query} navigate={navigate} />;
}

export default function App() {
  const { path, query, navigate } = useHashRoute();
  const { user } = useAuth();
  const [theme, setTheme] = useTheme();
  const isPublic = path === '/login' || path === '/register';

  useEffect(() => {
    if (!user && !isPublic) navigate('/login', { replace: true });
    if (user && (isPublic || path === '/')) navigate('/dashboard', { replace: true });
  }, [user, isPublic, path, navigate]);

  if (!user) {
    if (path === '/register') return <RegisterPage navigate={navigate} />;
    return <LoginPage navigate={navigate} />;
  }

  return (
    <DataProvider>
      <Layout path={path} theme={theme} setTheme={setTheme}>
        <Protected path={path} query={query} navigate={navigate} />
      </Layout>
    </DataProvider>
  );
}
