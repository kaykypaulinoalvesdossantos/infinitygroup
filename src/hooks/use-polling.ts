'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface PollingResult<T> {
  data: T | undefined;
  error: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Executa `fn` ao montar e a cada `intervalMs`. Pausa enquanto a aba estiver oculta
 * e atualiza ao voltar. `deps` reinicia o ciclo quando mudam (ex.: campanha selecionada).
 * Respostas antigas (de uma chamada anterior) são descartadas.
 */
export function usePolling<T>(fn: () => Promise<T>, intervalMs: number, deps: unknown[] = []): PollingResult<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fnRef = useRef(fn);
  const mountedRef = useRef(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    fnRef.current = fn;
  });

  const run = useCallback(async (): Promise<void> => {
    const requestId = ++requestIdRef.current;
    try {
      const result = await fnRef.current();
      if (!mountedRef.current || requestId !== requestIdRef.current) return;
      setData(result);
      setError(null);
    } catch (err) {
      if (!mountedRef.current || requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      if (mountedRef.current && requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    void run();

    const timer = window.setInterval(() => {
      if (!document.hidden) void run();
    }, intervalMs);

    const onVisibility = () => {
      if (!document.hidden) void run();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      mountedRef.current = false;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // `deps` controla o reinicio do ciclo; o tamanho do array é fixo por chamada.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, run, ...deps]);

  const refresh = useCallback(() => run(), [run]);

  return { data, error, loading, refresh };
}
