import EmptyState from '../components/EmptyState.jsx';

export default function NotFoundPage() {
  return <EmptyState icon="alert" title="Сторінку не знайдено" text="Перевірте адресу або поверніться на головну."
    action={<a className="btn btn--primary" href="#/dashboard">На головну</a>} />;
}
