import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { REFRESH_TOKEN_KEY, TOKEN_KEY } from '@/utils/constants';

/**
 * Service for secure and non-secure local persistence.
 */
export const storageService = {
  async setAccessToken(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async getAccessToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(TOKEN_KEY);
    }
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  async setRefreshToken(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
      return;
    }
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  },
  async getRefreshToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },
  async removeTokens(): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
  async setItem<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  async getItem<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
};
