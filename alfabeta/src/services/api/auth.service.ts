import type { User } from '@/@types/navigation';
import { mockTokens, mockUser } from '@/mocks/auth.mock';
import { storageService } from '@/services/storage/storage.service';
import { IS_MOCK } from '@/utils/constants';
import { sanitizeText } from '@/utils/formatters';

import { apiClient } from './client';

interface AuthPayload {
  email: string;
  password: string;
}

/**
 * Authentication layer with switchable mock/real implementation.
 */
export const authService = {
  async login(payload: AuthPayload): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const safePayload = { ...payload, email: sanitizeText(payload.email) };
    if (IS_MOCK) {
      if (!safePayload.email || !safePayload.password) {
        throw new Error('Credenciais invalidas.');
      }
      return { user: mockUser, ...mockTokens };
    }
    const response = await apiClient.post('/auth/login', safePayload);
    return response.data;
  },
  async register(payload: { name: string; email: string; password: string; role: string }): Promise<void> {
    if (IS_MOCK) return;
    await apiClient.post('/auth/register', {
      ...payload,
      name: sanitizeText(payload.name),
      email: sanitizeText(payload.email),
    });
  },
  async forgotPassword(email: string): Promise<void> {
    if (IS_MOCK) return;
    await apiClient.post('/auth/forgot-password', { email: sanitizeText(email) });
  },
  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = await storageService.getRefreshToken();
    if (IS_MOCK) {
      return { ...mockTokens, accessToken: `${mockTokens.accessToken}-${Date.now()}` };
    }
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};
