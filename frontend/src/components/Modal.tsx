'use client';
import { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';

export function Modal({ open, onClose, title, subtitle, children, footer }: {
  open: boolean; onClose: () => void; title: string; subtitle?: string;
  children: ReactNode; footer?: ReactNode;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box animate-in">
        <div className="modal-header">
          <div>
            <div className="modal-title">{title}</div>
            {subtitle && <div className="modal-subtitle">{subtitle}</div>}
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
