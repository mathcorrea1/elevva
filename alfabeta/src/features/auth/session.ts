import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const base =
  process.env.EXPO_PUBLIC_AUTH_URL ||
  (__DEV__ && Platform.OS === 'web' ? 'http://localhost:3001' : '');
let nativeToken: string | null = null;
let generation = 0;
export const sessionGeneration = () => generation;
const expiryListeners = new Set<() => void>();
export function onSessionExpired(listener: () => void) {
  expiryListeners.add(listener);
  return () => {
    expiryListeners.delete(listener);
  };
}
export function expireSession() {
  generation++;
  nativeToken = null;
  if (Platform.OS !== 'web') void SecureStore.deleteItemAsync('eleva.auth');
  expiryListeners.forEach((listener) => listener());
}
export type Identity = { id: string; name: string };
export interface SessionAdapter {
  restore(): Promise<Identity | null>;
  signIn(email: string, password: string): Promise<Identity>;
  signUp(name: string, email: string, password: string): Promise<Identity>;
  logout(): Promise<void>;
  headers(): Promise<Record<string, string>>;
}
export async function authRequest(path: string, data?: object) {
  if (!base) throw new Error('Configure EXPO_PUBLIC_AUTH_URL com endereço acessível ao aparelho.');
  if (Platform.OS !== 'web' && /localhost|127\.0\.0\.1/.test(base))
    throw new Error('O Android precisa de EXPO_PUBLIC_AUTH_URL acessível pela rede.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(base + '/api/auth' + path, {
      signal: controller.signal,
      method: data ? 'POST' : 'GET',
      credentials: Platform.OS === 'web' ? 'include' : 'omit',
      headers: {
        'Content-Type': 'application/json',
        ...(nativeToken ? { Authorization: 'Bearer ' + nativeToken } : {}),
      },
      ...(data ? { body: JSON.stringify(data) } : {}),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Não foi possível autenticar.');
    const token = response.headers.get('set-auth-token') || result.token;
    if (Platform.OS !== 'web' && token) {
      nativeToken = token;
      await SecureStore.setItemAsync('eleva.auth', token);
    }
    return result;
  } catch (error) {
    if ((error as Error).name === 'AbortError')
      throw new Error('O serviço de conta demorou a responder. Tente novamente.');
    if (error instanceof TypeError)
      throw new Error('Não foi possível conectar ao serviço de conta. Confira a rede.');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
export const betterAuthSession: SessionAdapter = {
  async restore() {
    if (Platform.OS !== 'web') nativeToken = await SecureStore.getItemAsync('eleva.auth');
    const result = await authRequest('/get-session');
    return result?.user ? { id: result.user.id, name: result.user.name } : null;
  },
  async signIn(email, password) {
    const result = await authRequest('/sign-in/email', { email, password });
    generation++;
    return result.user;
  },
  async signUp(name, email, password) {
    const result = await authRequest('/sign-up/email', { name, email, password });
    generation++;
    return result.user;
  },
  async logout() {
    generation++;
    try {
      await authRequest('/sign-out', {});
    } finally {
      generation++;
      nativeToken = null;
      if (Platform.OS !== 'web') await SecureStore.deleteItemAsync('eleva.auth');
    }
  },
  async headers(): Promise<Record<string, string>> {
    return nativeToken ? { Authorization: 'Bearer ' + nativeToken } : {};
  },
};
