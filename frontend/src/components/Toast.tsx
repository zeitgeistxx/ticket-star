'use client';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  desc?: string;
}

interface ToastCtx {
  toast: (type: ToastType, title: string, desc?: string) => void;
  success: (title: string, desc?: string) => void;
  error: (title: string, desc?: string) => void;
  warning: (title: string, desc?: string) => void;
  info: (title: string, desc?: string) => void;
}

const Ctx = createContext<ToastCtx>(null!);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((type: ToastType, title: string, desc?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(p => [...p, { id, type, title, desc }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4500);
  }, []);

  const remove = (id: string) => setToasts(p => p.filter(t => t.id !== id));

  const ICONS: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={18} />,
    error: <XCircle size={18} />,
    warning: <AlertTriangle size={18} />,
    info: <Info size={18} />,
  };

  return (
    <Ctx.Provider value={{
      toast,
      success: (t, d) => toast('success', t, d),
      error: (t, d) => toast('error', t, d),
      warning: (t, d) => toast('warning', t, d),
      info: (t, d) => toast('info', t, d),
    }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span className="toast-icon">{ICONS[t.type]}</span>
            <div className="toast-content">
              <div className="toast-title">{t.title}</div>
              {t.desc && <div className="toast-desc">{t.desc}</div>}
            </div>
            <button className="toast-close" onClick={() => remove(t.id)}><X size={14} /></button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
