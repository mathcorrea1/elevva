import type { User } from '@/@types/navigation';
import { authService } from '@/services/api/auth.service';
import { storageService } from '@/services/storage/storage.service';
import { ONBOARDING_KEY, USER_KEY } from '@/utils/constants';
import { logger } from '@/utils/errorHandler';

import { create } from 'zustand';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  onboardingDone: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; role: string }) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setOnboardingDone: () => Promise<void>;
  logout: () => Promise<void>;
}

// DECISION: Zustand chosen for simple global state with low boilerplate and async actions.
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isBootstrapping: true,
  onboardingDone: false,
  hydrate: async () => {
    try {
      const [user, accessToken, refreshToken, onboardingDone] = await Promise.all([
        storageService.getItem<User>(USER_KEY),
        storageService.getAccessToken(),
        storageService.getRefreshToken(),
        storageService.getItem<boolean>(ONBOARDING_KEY),
      ]);

      set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: Boolean(user && accessToken),
        onboardingDone: Boolean(onboardingDone),
        isBootstrapping: false,
      });
    } catch {
      logger.error('hydrate failed', { reason: 'storage error' });
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        onboardingDone: false,
        isBootstrapping: false,
      });
    }
  },
  login: async (email, password) => {
    const response = await authService.login({ email, password });
    await storageService.setItem(USER_KEY, response.user);
    await storageService.setAccessToken(response.accessToken);
    await storageService.setRefreshToken(response.refreshToken);
    set({
      user: response.user,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      isAuthenticated: true,
    });
  },
  register: async ({ name, email, password, role }) => {
    await authService.register({ name, email, password, role });
  },
  forgotPassword: async (email) => {
    await authService.forgotPassword(email);
  },
  setTokens: (accessToken, refreshToken) => {
    void storageService.setAccessToken(accessToken);
    void storageService.setRefreshToken(refreshToken);
    set({ accessToken, refreshToken });
  },
  setOnboardingDone: async () => {
    await storageService.setItem(ONBOARDING_KEY, true);
    set({ onboardingDone: true });
  },
  logout: async () => {
    await storageService.removeTokens();
    await storageService.removeItem(USER_KEY);
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },
}));
