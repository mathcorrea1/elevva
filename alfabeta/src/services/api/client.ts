import axios from 'axios';

import { authService } from './auth.service';

import { useAuthStore } from '@/store/auth.store';
import { API_BASE_URL, API_TIMEOUT_MS, APP_VERSION } from '@/utils/constants';
import { logger } from '@/utils/errorHandler';

// Certificate pinning can be added in production native builds with a dedicated TLS library.

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Version': APP_VERSION,
  },
});

let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

const resolveQueue = (token: string): void => {
  queue.forEach((cb) => cb(token));
  queue = [];
};

apiClient.interceptors.request.use(async (config) => {
  const { accessToken } = useAuthStore.getState();
  const protectedRoute = !config.url?.includes('/auth/login') && !config.url?.includes('/auth/register');
  if (protectedRoute && !accessToken) {
    return Promise.reject(new Error('401 missing token'));
  }
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original?._retry) {
      original._retry = true;
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newTokens = await authService.refreshToken();
          useAuthStore.getState().setTokens(newTokens.accessToken, newTokens.refreshToken);
          resolveQueue(newTokens.accessToken);
        } catch (refreshError) {
          logger.error('refresh failed', { reason: 'token expired' });
          await useAuthStore.getState().logout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
      return new Promise((resolve) => {
        queue.push((token: string) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(original));
        });
      });
    }
    return Promise.reject(error);
  },
);
