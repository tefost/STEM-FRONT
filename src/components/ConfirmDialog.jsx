import { useState } from 'react';
import Modal from './Modal.jsx';

export default function ConfirmDialog({ title, text, confirmLabel = 'Видалити', onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      setBusy(false);
    }
  };
  return (
    <Modal title={title} onClose={onClose} size="sm"
      footer={<>
        <button className="btn btn--ghost" onClick={onClose} disabled={busy}>Скасувати</button>
        <button className="btn btn--danger" onClick={run} disabled={busy}>{busy ? 'Видалення…' : confirmLabel}</button>
      </>}>
      <p>{text}</p>
    </Modal>
  );
}
