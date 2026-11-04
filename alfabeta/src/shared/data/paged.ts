import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { repository } from '@/shared/http/repository';
export type PageResult<T> = { items: T[]; total: number; next_offset: number | null };
export function useDebounced<T>(value: T, delay = 300) {
  const [result, setResult] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setResult(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return result;
}
export function usePaged<T>(path: string | null) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [next, setNext] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const epoch = useRef(0);
  const currentPath = useRef(path);
  currentPath.current = path;
  const [resolvedPath, setResolvedPath] = useState<string | null>(null);
  const focused = useRef(false);
  const running = useRef(false);
  const nextRef = useRef<number | null>(null);
  const load = useCallback(
    async (offset = 0, reset = false) => {
      if (!path || path !== currentPath.current || !focused.current) return;
      if (running.current && !reset) return;
      const current = reset ? ++epoch.current : epoch.current;
      running.current = true;
      setLoading(true);
      setError('');
      if (reset) {
        setItems([]);
        setTotal(0);
        setNext(null);
        nextRef.current = null;
      }
      try {
        const result = await repository.get<PageResult<T>>(
          path + (path.includes('?') ? '&' : '?') + 'offset=' + offset + '&limit=20',
        );
        if (current !== epoch.current || path !== currentPath.current || !focused.current) return;
        setItems((old) => (reset ? result.items : [...old, ...result.items]));
        setTotal(result.total);
        setNext(result.next_offset);
        nextRef.current = result.next_offset;
        setResolvedPath(path);
      } catch (e) {
        if (current === epoch.current && path === currentPath.current && focused.current) {
          setError((e as Error).message);
          setResolvedPath(path);
        }
      } finally {
        if (current === epoch.current && path === currentPath.current && focused.current) {
          running.current = false;
          setLoading(false);
        }
      }
    },
    [path],
  );
  const reload = useCallback(() => load(0, true), [load]);
  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      if (path) void reload();
      else {
        setItems([]);
        setTotal(0);
        setLoading(false);
        setResolvedPath(null);
        setNext(null);
        nextRef.current = null;
      }
      return () => {
        focused.current = false;
        epoch.current++;
        running.current = false;
        setItems([]);
      };
    }, [path, reload]),
  );
  return {
    items: resolvedPath === path ? items : [],
    total: resolvedPath === path ? total : 0,
    next: resolvedPath === path ? next : null,
    loading: !!path && (loading || resolvedPath !== path),
    error: resolvedPath === path ? error : '',
    reload,
    more: () => (nextRef.current !== null ? load(nextRef.current) : Promise.resolve()),
  };
}
