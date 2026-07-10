'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useToastStore, Toast } from '../../store/toast-store';

const iconMap = {
  success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
  error: <AlertCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
  loading: (
    <svg className="animate-spin h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  ),
};

const ToastCard = ({ toast }: { toast: Toast }) => {
  const { removeToast } = useToastStore();

  React.useEffect(() => {
    if (toast.type !== 'loading') {
      const duration = toast.duration || 5000;
      const timer = setTimeout(() => {
        removeToast(toast.id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [toast, removeToast]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ duration: 0.2 }}
      className="flex w-full max-w-sm overflow-hidden rounded-xl border border-border bg-card p-4 shadow-lg glass"
    >
      <div className="flex items-start gap-3 w-full">
        <div className="flex-shrink-0 mt-0.5">{iconMap[toast.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{toast.title}</p>
          {toast.description && <p className="text-xs text-muted-foreground mt-1">{toast.description}</p>}
          {toast.undoAction && (
            <button
              onClick={() => {
                toast.undoAction?.onClick();
                removeToast(toast.id);
              }}
              className="text-xs font-semibold text-zinc-950 dark:text-zinc-50 hover:underline mt-2 flex items-center cursor-pointer"
            >
              {toast.undoAction.label}
            </button>
          )}
        </div>
        <button
          onClick={() => removeToast(toast.id)}
          className="flex-shrink-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted p-1 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

export const ToastContainer = () => {
  const { toasts } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastCard toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
