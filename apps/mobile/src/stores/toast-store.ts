import { create } from 'zustand';

export type MobileToastType = 'success' | 'error' | 'info' | 'warning';

export interface MobileToast {
  id: string;
  type: MobileToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ToastState {
  toasts: MobileToast[];
  confirmModal: ConfirmModalState;

  showToast: (toast: Omit<MobileToast, 'id'>) => void;
  removeToast: (id: string) => void;
  showConfirm: (config: Omit<ConfirmModalState, 'isOpen'>) => void;
  hideConfirm: () => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  confirmModal: {
    isOpen: false,
    title: '',
  },

  showToast: (toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const duration = toast.duration ?? 3500;

    set((state) => ({
      toasts: [...state.toasts.slice(-2), { ...toast, id, duration }], // Keep max 3
    }));

    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  showConfirm: (config) => {
    set({
      confirmModal: {
        ...config,
        isOpen: true,
      },
    });
  },

  hideConfirm: () => {
    set({
      confirmModal: {
        isOpen: false,
        title: '',
      },
    });
  },
}));

// Quick helper functions for mobile
export const mobileToast = {
  success: (title: string, message?: string, duration?: number) => {
    useToastStore.getState().showToast({ type: 'success', title, message, duration });
  },
  error: (title: string, message?: string, duration?: number) => {
    useToastStore.getState().showToast({ type: 'error', title, message, duration });
  },
  info: (title: string, message?: string, duration?: number) => {
    useToastStore.getState().showToast({ type: 'info', title, message, duration });
  },
  warning: (title: string, message?: string, duration?: number) => {
    useToastStore.getState().showToast({ type: 'warning', title, message, duration });
  },
  confirm: (config: Omit<ConfirmModalState, 'isOpen'>) => {
    useToastStore.getState().showConfirm(config);
  },
};
