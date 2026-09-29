import { useCallback, useEffect, useState } from 'react';
import type { Paginated } from './api/types';
import { errorMessage } from './utils';

/** Ambil data list berpaginasi; otomatis refetch saat query berubah */
export function usePaginated<T, Q extends object>(fetcher: (q: Q) => Promise<Paginated<T>>, query: Q) {
  const [result, setResult] = useState<Paginated<T>>({ data: [], total: 0, page: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const key = JSON.stringify(query);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setResult(await fetcher(JSON.parse(key)));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...result, loading, error, reload: load };
}

/** Nilai yang baru berubah setelah user berhenti mengetik */
export function useDebounced<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
