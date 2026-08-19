'use client';
import { Modal } from './Modal';

export function ConfirmDialog({ open, onClose, onConfirm, title, desc, danger }: {
  open: boolean; onClose: () => void; onConfirm: () => void;
  title: string; desc: string; danger?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} subtitle={desc}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={() => { onConfirm(); onClose(); }}>
            {danger ? 'Confirm Delete' : 'Confirm'}
          </button>
        </>
      }
    ><div /></Modal>
  );
}
