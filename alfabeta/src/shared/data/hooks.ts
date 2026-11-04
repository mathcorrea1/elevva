import { useCallback, useEffect, useRef, useState } from 'react';
import { repository, operationId } from '@/shared/http/repository';
import { useFocusEffect } from '@react-navigation/native';
import { AppState } from 'react-native';

export function useResource<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [resolvedPath, setResolvedPath] = useState<string | null>(null);
  const epoch = useRef(0);
  const currentPath = useRef(path);
  currentPath.current = path;
  const reload = useCallback(async () => {
    if (path !== currentPath.current) return;
    const current = ++epoch.current;
    if (!path) {
      setData(null);
      setLoading(false);
      setError('');
      setResolvedPath(null);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await repository.get<T>(path);
      if (current === epoch.current && path === currentPath.current) {
        setData(result);
        setResolvedPath(path);
      }
    } catch (e) {
      if (current === epoch.current && path === currentPath.current) {
        setError((e as Error).message);
        setData(null);
        setResolvedPath(path);
      }
    } finally {
      if (current === epoch.current && path === currentPath.current) setLoading(false);
    }
  }, [path]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setData(null);
        void reload();
      }
    });
    return () => {
      epoch.current++;
      subscription.remove();
    };
  }, [reload]);
  useFocusEffect(
    useCallback(() => {
      void reload();
      return () => {
        epoch.current++;
        setData(null);
      };
    }, [reload]),
  );
  return {
    data: resolvedPath === path ? data : null,
    error: resolvedPath === path ? error : '',
    loading: !!path && (loading || resolvedPath !== path),
    reload,
  };
}

export function useCommand() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const pending = useRef({ fingerprint: '', key: '' });
  const running = useRef(false);
  async function run<T>(
    path: string,
    body: object,
    after?: (result: T) => void | Promise<void>,
    method = 'POST',
  ) {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setError('');
    setMessage('Salvando…');
    const fingerprint = JSON.stringify([path, body, method]);
    if (pending.current.fingerprint !== fingerprint)
      pending.current = { fingerprint, key: operationId() };
    try {
      const result = await repository.command<T>(path, body, pending.current.key, method);
      pending.current = { fingerprint: '', key: '' };
      setMessage('Salvo.');
      try {
        await after?.(result);
      } catch {
        setMessage('Salvo. Não foi possível atualizar a tela; recarregue para consultar.');
      }
    } catch (e) {
      setError((e as Error).message);
      setMessage(
        'Salvamento não confirmado. Seu formulário foi preservado. Tente novamente para conferir sem duplicar.',
      );
    } finally {
      running.current = false;
      setBusy(false);
    }
  }
  return { run, busy, message, error };
}
