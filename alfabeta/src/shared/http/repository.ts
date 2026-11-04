import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';
import { validateResponse } from '@/shared/contracts/validate';
import { expireSession } from '@/features/auth/session';
import { betterAuthSession, sessionGeneration } from '@/features/auth/session';
import { ApiError } from './errors';
const base =
  process.env.EXPO_PUBLIC_API_URL ||
  (__DEV__ && Platform.OS === 'web' ? 'http://localhost:8100' : '');
export const operationId = () => Crypto.randomUUID();
export interface Repository {
  get<T>(path: string): Promise<T>;
  command<T>(path: string, body: object, key: string, method?: string): Promise<T>;
}
export class ApiRepository implements Repository {
  private async request<T>(path: string, method: string, body?: object, key?: string): Promise<T> {
    if (!base || (Platform.OS !== 'web' && /localhost|127\.0\.0\.1/.test(base)))
      throw new Error('Configure EXPO_PUBLIC_API_URL com endereço remoto acessível ao Android.');
    const current = sessionGeneration();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), path.endsWith('/analyses') ? 55000 : 15000);
    try {
      const headers = await betterAuthSession.headers();
      const response = await fetch(base + path, {
        method,
        credentials: Platform.OS === 'web' ? 'include' : 'omit',
        signal: controller.signal,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          ...(key ? { 'Idempotency-Key': key } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const data = await response.json();
      if (current !== sessionGeneration())
        throw new Error('Conta alterada; resposta anterior descartada.');
      if (response.status === 401) expireSession();
      if (!response.ok)
        throw new ApiError(
          response.status,
          typeof data.detail === 'string' ? data.detail : 'Verifique os campos e tente novamente.',
        );
      return validateResponse(path, method, data) as T;
    } catch (error) {
      if ((error as Error).name === 'AbortError')
        throw new Error(
          'Tempo de resposta esgotado. Tente confirmar novamente sem duplicar a gravação.',
        );
      if (error instanceof TypeError)
        throw new Error('Sem conexão com o servidor. Confira a rede e tente novamente.');
      if (error instanceof SyntaxError)
        throw new Error(
          'O servidor enviou uma resposta inesperada. A gravação ainda não foi confirmada.',
        );
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }
  get<T>(path: string) {
    return this.request<T>(path, 'GET');
  }
  command<T>(path: string, body: object, key: string, method = 'POST') {
    return this.request<T>(path, method, body, key);
  }
}
// Composition chooses a repository once. UI has no mock fallback.
export const repository: Repository = new ApiRepository();
