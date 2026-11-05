export default function ProgressBar({ value, label, tone = 'primary' }) {
  return (
    <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-label={label}>
      <div className={`progress__fill progress__fill--${tone}`} style={{ width: `${value}%` }} />
    </div>
  );
}
