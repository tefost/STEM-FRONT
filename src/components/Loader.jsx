export default function Loader({ label = 'Завантаження даних…' }) {
  return (
    <div className="loader" role="status">
      <span className="spinner spinner--lg" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
