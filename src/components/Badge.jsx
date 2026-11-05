import { PRIORITIES, REQ_STATUSES, TC_STATUSES } from '../utils/constants.js';

const LABELS = { priority: PRIORITIES, req: REQ_STATUSES, tc: TC_STATUSES };

export default function Badge({ kind, value }) {
  const label = LABELS[kind]?.[value] || value;
  return <span className={`badge badge--${kind}-${value}`}>{label}</span>;
}
