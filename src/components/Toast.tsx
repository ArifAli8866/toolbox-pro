'use client';

import { useState, createContext, useContext, useCallback } from 'react';
import { CheckCircle, XCircle, X, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const noop = () => {};
const ToastContext = createContext<ToastContextType>({ addToast: noop, success: noop, error: noop, info: noop, warning: noop });

export const useToast = () => useContext(ToastContext);

const iconMap: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: { bg: 'bg-success-50', icon: 'text-success-500', border: 'border-success-200' },
  error: { bg: 'bg-danger-50', icon: 'text-danger-500', border: 'border-danger-200' },
  info: { bg: 'bg-brand-50', icon: 'text-brand-500', border: 'border-brand-200' },
  warning: { bg: 'bg-warning-50', icon: 'text-warning-500', border: 'border-yellow-200' },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  const Icon = iconMap[toast.type];
  const colors = colorMap[toast.type];

  return (
    <div className={`animate-toast-in flex items-start gap-3 p-4 rounded-xl border ${colors.bg} ${colors.border} shadow-lg max-w-sm`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colors.icon}`} />
      <p className="text-sm text-slate-700 flex-1 leading-relaxed">{toast.message}</p>
      <button onClick={() => onRemove(toast.id)} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{
      addToast,
      success: (msg) => addToast(msg, 'success'),
      error: (msg) => addToast(msg, 'error'),
      info: (msg) => addToast(msg, 'info'),
      warning: (msg) => addToast(msg, 'warning'),
    }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
