'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, Sparkles, X } from 'lucide-react';
import { clsx } from 'clsx';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  success: (title: string, message?: string, duration?: number) => void;
  error: (title: string, message?: string, duration?: number) => void;
  info: (title: string, message?: string, duration?: number) => void;
  warning: (title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let globalToastFn: ((toast: Omit<ToastItem, 'id'>) => void) | null = null;

export const toast = {
  success: (title: string, message?: string, duration?: number) => {
    globalToastFn?.({ type: 'success', title, message, duration });
  },
  error: (title: string, message?: string, duration?: number) => {
    globalToastFn?.({ type: 'error', title, message, duration });
  },
  info: (title: string, message?: string, duration?: number) => {
    globalToastFn?.({ type: 'info', title, message, duration });
  },
  warning: (title: string, message?: string, duration?: number) => {
    globalToastFn?.({ type: 'warning', title, message, duration });
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((newToast: Omit<ToastItem, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const duration = newToast.duration ?? 4000;

    setToasts((prev) => [...prev, { ...newToast, id, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  globalToastFn = showToast;

  const success = (title: string, message?: string, duration?: number) =>
    showToast({ type: 'success', title, message, duration });
  const error = (title: string, message?: string, duration?: number) =>
    showToast({ type: 'error', title, message, duration });
  const info = (title: string, message?: string, duration?: number) =>
    showToast({ type: 'info', title, message, duration });
  const warning = (title: string, message?: string, duration?: number) =>
    showToast({ type: 'warning', title, message, duration });

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        success,
        error,
        info,
        warning,
        removeToast,
      }}
    >
      {children}

      {/* Floating Toasts Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';
          const isInfo = t.type === 'info';

          return (
            <div
              key={t.id}
              className={clsx(
                'pointer-events-auto p-4 rounded-2xl border shadow-xl backdrop-blur-xl transition-all animate-in slide-in-from-top-4 fade-in duration-200 relative overflow-hidden flex items-start gap-3.5 bg-white',
                isSuccess && 'border-[#A7F3D0] shadow-emerald-500/10',
                isError && 'border-[#FECACA] shadow-rose-500/10',
                isWarning && 'border-[#FDE68A] shadow-amber-500/10',
                isInfo && 'border-[#99F6E4] shadow-teal-500/10',
              )}
            >
              {/* Subtle top indicator bar */}
              <div
                className={clsx(
                  'absolute top-0 left-0 right-0 h-1',
                  isSuccess && 'bg-gradient-to-r from-[#059669] to-[#10B981]',
                  isError && 'bg-gradient-to-r from-[#DC2626] to-[#EF4444]',
                  isWarning && 'bg-gradient-to-r from-[#D97706] to-[#F59E0B]',
                  isInfo && 'bg-gradient-to-r from-[#0D9488] to-[#2DD4BF]',
                )}
              />

              {/* Icon */}
              <div
                className={clsx(
                  'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs',
                  isSuccess && 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]',
                  isError && 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]',
                  isWarning && 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]',
                  isInfo && 'bg-[#CCFBF1] text-[#0D9488] border border-[#99F6E4]',
                )}
              >
                {isSuccess && <CheckCircle2 className="w-5 h-5" />}
                {isError && <AlertCircle className="w-5 h-5" />}
                {isWarning && <Sparkles className="w-5 h-5" />}
                {isInfo && <Info className="w-5 h-5" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pr-2">
                <h4 className="font-bold text-sm text-slate-900 tracking-tight leading-snug">
                  {t.title}
                </h4>
                {t.message && (
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed break-words">
                    {t.message}
                  </p>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => removeToast(t.id)}
                className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
