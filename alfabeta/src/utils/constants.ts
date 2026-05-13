export const APP_VERSION = '1.0.0';
export const TOKEN_KEY = 'elevva.access_token';
export const REFRESH_TOKEN_KEY = 'elevva.refresh_token';
export const USER_KEY = 'elevva.user';
export const ONBOARDING_KEY = 'elevva.onboarding.completed';
export const API_TIMEOUT_MS = 10000;
const useMockFlag = process.env.EXPO_PUBLIC_USE_MOCK;
export const IS_MOCK = useMockFlag ? useMockFlag === 'true' : true;
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';
