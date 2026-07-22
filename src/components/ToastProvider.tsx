'use client';

import React, { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, X, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toast: (type: ToastType, title: string, message?: string) => void;
  confirm: (message: string, onConfirm: () => void) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
  confirm: () => {},
});

export const useToast = () => useContext(ToastContext);

const ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES: Record<ToastType, string> = {
  success: 'border-emerald-500/20 bg-surface-100 text-content-primary',
  error: 'border-red-500/20 bg-surface-100 text-content-primary',
  warning: 'border-amber-500/20 bg-surface-100 text-content-primary',
  info: 'border-hairline bg-surface-100 text-content-primary',
};

const ICON_STYLES: Record<ToastType, string> = {
  success: 'text-emerald-500',
  error: 'text-red-400',
  warning: 'text-amber-500',
  info: 'text-content-secondary',
};

interface ConfirmState {
  message: string;
  onConfirm: () => void;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const toast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const confirm = useCallback((message: string, onConfirm: () => void) => {
    setConfirmState({ message, onConfirm });
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Toast container — bottom-right corner */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-2xl max-w-sm animate-in slide-in-from-right-8 duration-300 ${STYLES[t.type]}`}
            >
              <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${ICON_STYLES[t.type]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold leading-tight">{t.title}</p>
                {t.message && <p className="text-xs mt-0.5 opacity-80 leading-snug">{t.message}</p>}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 opacity-60 hover:opacity-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirm dialog — styled modal, replaces window.confirm() */}
      {confirmState && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border border-hairline bg-surface-100 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3 mb-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-content-primary mb-1">Are you sure?</h3>
                <p className="text-xs text-content-secondary leading-snug">{confirmState.message}</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmState(null)}
                className="rounded-lg border border-hairline bg-surface-200 px-4 py-2 text-xs font-medium text-content-primary hover:bg-surface-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmState.onConfirm();
                  setConfirmState(null);
                }}
                className="rounded-lg bg-red-500/80 hover:bg-red-500 px-4 py-2 text-xs font-medium text-white transition-colors"
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
