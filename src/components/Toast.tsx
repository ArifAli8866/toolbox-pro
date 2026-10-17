'use client';

import React, { useState, createContext, useContext, useCallback } from 'react';
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
const ToastContext = createContext<ToastContextType>({
  addToast: noop,
  success: noop,
  error: noop,
  info: noop,
  warning: noop,
});

export const useToast = () => useContext(ToastContext);

const iconMap: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/80',
    icon: 'text-emerald-500 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950/80',
    icon: 'text-red-500 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
  },
  info: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/80',
    icon: 'text-indigo-500 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-800',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/80',
    icon: 'text-amber-500 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
  },
};

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: number) => void;
}) {
  const Icon = iconMap[toast.type];
  const colors = colorMap[toast.type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`animate-toast-in flex items-start gap-3 p-4 rounded-xl border ${colors.bg} ${colors.border} shadow-lg shadow-black/5 dark:shadow-black/40 backdrop-blur-md max-w-sm w-full transition-all`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colors.icon}`} />
      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 flex-1 leading-relaxed font-medium">
        {toast.message}
      </p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-shrink-0 p-0.5 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider
      value={{
        addToast,
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        info: (msg) => addToast(msg, 'info'),
        warning: (msg) => addToast(msg, 'warning'),
      }}
    >
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-4 sm:p-0">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
