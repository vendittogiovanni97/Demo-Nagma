"use client";

import useSWR from 'swr';

/**
 * Hook SWR condiviso per i movimenti "liberi" del mese (spese/entrate libere).
 * Unifica la strategia di fetch tra le pagine gemelle.
 */
export function useLiberaMovimenti<T>(
  cacheKey: string,
  getAll: (month: string) => Promise<T[]>,
  monthStr: string,
) {
  const { data, isLoading, error, mutate } = useSWR<T[]>(
    monthStr ? [cacheKey, monthStr] : null,
    () => getAll(monthStr),
  );

  return { data, isLoading, error, mutate };
}
