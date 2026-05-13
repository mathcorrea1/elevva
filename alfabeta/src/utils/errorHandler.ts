import type { LiteracyLevel } from './literacy.levels';

const sensitive = ['password', 'token', 'accessToken', 'refreshToken', 'child', 'children'];

const scrub = (data: Record<string, unknown>): Record<string, unknown> => {
  const copy: Record<string, unknown> = {};
  Object.entries(data).forEach(([key, value]) => {
    copy[key] = sensitive.includes(key) ? '[REDACTED]' : value;
  });
  return copy;
};

export const logger = {
  info: (message: string, meta: Record<string, unknown> = {}) => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log(message, scrub(meta));
    }
  },
  error: (message: string, meta: Record<string, unknown> = {}) => {
    // eslint-disable-next-line no-console
    console.error(message, scrub(meta));
  },
};

export const friendlyError = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message.includes('Network')) return 'Sem conexao no momento.';
    if (error.message.includes('401')) return 'Sessao expirada. Faca login novamente.';
  }
  return 'Algo deu errado. Tente novamente em instantes.';
};

export const defaultLevel: LiteracyLevel = 'pre-silabico' as LiteracyLevel;
