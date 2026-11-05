import Icon from './Icon.jsx';

export default function EmptyState({ icon = 'list', title, text, action }) {
  return (
    <div className="empty">
      <Icon name={icon} size={36} />
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}
