import { useCallback, useEffect, useState } from 'react';

export type LoadState<T> =
  | Readonly<{ status: 'loading' }>
  | Readonly<{ status: 'error'; error: unknown }>
  | Readonly<{ status: 'ready'; data: T }>;

/**
 * Runs `load` when the screen opens, again on reload, and again (keeping the old data on screen)
 * when `refreshKey` changes. `load` must be stable (useCallback).
 */
export function useLoad<T>(load: () => Promise<T>, refreshKey = 0) {
  const [state, setState] = useState<LoadState<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    load().then(
      (data) => !cancelled && setState({ status: 'ready', data }),
      (error) => !cancelled && setState({ status: 'error', error }),
    );
    return () => {
      cancelled = true;
    };
  }, [load, attempt, refreshKey]);

  const reload = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  return { state, reload };
}
