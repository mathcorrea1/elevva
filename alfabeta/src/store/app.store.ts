import { Appearance } from 'react-native';

import { storageService } from '@/services/storage/storage.service';
import { THEME_PREFERENCE_KEY } from '@/utils/constants';

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ThemePreference = 'system' | 'light' | 'dark';

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
  themePreference: ThemePreference;
  isThemeHydrated: boolean;
  setOffline: (value: boolean) => void;
  showToast: (payload: Omit<ToastPayload, 'id'>) => void;
  clearToast: () => void;
  hydrateThemePreference: () => Promise<void>;
  setThemePreference: (value: ThemePreference) => Promise<void>;
}

const applyThemePreference = (value: ThemePreference) => {
  Appearance.setColorScheme(value === 'system' ? null : value);
};

export const useAppStore = create<AppState>((set) => ({
  isOffline: false,
  toast: null,
  themePreference: 'system',
  isThemeHydrated: false,
  setOffline: (value) => set({ isOffline: value }),
  showToast: (payload) => set({ toast: { ...payload, id: `toast-${Date.now()}` } }),
  clearToast: () => set({ toast: null }),
  hydrateThemePreference: async () => {
    const saved = await storageService.getItem<ThemePreference>(THEME_PREFERENCE_KEY);
    const preference: ThemePreference = saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
    applyThemePreference(preference);
    set({ themePreference: preference, isThemeHydrated: true });
  },
  setThemePreference: async (value) => {
    await storageService.setItem(THEME_PREFERENCE_KEY, value);
    applyThemePreference(value);
    set({ themePreference: value });
  },
}));
