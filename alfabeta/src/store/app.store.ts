import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastPayload {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  position?: 'top' | 'bottom';
}

interface AppState {
  isOffline: boolean;
  toast: ToastPayload | null;
  setOffline: (value: boolean) => void;
  showToast: (payload: Omit<ToastPayload, 'id'>) => void;
  clearToast: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isOffline: false,
  toast: null,
  setOffline: (value) => set({ isOffline: value }),
  showToast: (payload) => set({ toast: { ...payload, id: `toast-${Date.now()}` } }),
  clearToast: () => set({ toast: null }),
}));
