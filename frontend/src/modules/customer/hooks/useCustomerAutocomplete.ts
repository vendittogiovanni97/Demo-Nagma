"use client";

import { useCallback, useMemo, useState } from 'react';
import { useDebouncedValue } from '@/common/hooks/useDebouncedValue';
import { useCustomers } from './useCustomer';

export interface CustomerOption {
  value: string;
  label: string;
}

interface UseCustomerAutocompleteOptions {
  enabled?: boolean;
  /** Numero minimo di caratteri prima di interrogare il server. */
  minChars?: number;
}

/**
 * Autocomplete clienti server-side.
 *
 * La precedente implementazione caricava TUTTI i clienti nel form booking
 * (`useCustomers({ limit: EXPORT_FETCH_LIMIT })`): degraderà con migliaia di
 * record. Questa hook interroga il backend solo a partire da un minimo di
 * caratteri (default 2), debounce 300ms e limite 25 risultati, mantenendo
 * visibile l'opzione selezionata anche quando la ricerca si restringe.
 */
export function useCustomerAutocomplete(config: UseCustomerAutocompleteOptions = {}) {
  const enabled = config.enabled ?? true;
  const minChars = config.minChars ?? 2;

  const [search, setSearch] = useState('');
  const [pinned, setPinned] = useState<CustomerOption | null>(null);
  const debouncedSearch = useDebouncedValue(search, 300);

  const shouldQuery = enabled && debouncedSearch.trim().length >= minChars;

  const { data, isLoading, error, mutate } = useCustomers({
    search: shouldQuery ? debouncedSearch.trim() : undefined,
    page: 1,
    limit: 25,
    enabled: shouldQuery,
  });

  const options = useMemo<CustomerOption[]>(() => {
    const list = (data?.data ?? []).map((c) => ({
      value: c.id.toString(),
      label: c.phone ? `${c.firstName} ${c.lastName} — ${c.phone}` : `${c.firstName} ${c.lastName}`,
    }));
    if (pinned && !list.some((o) => o.value === pinned.value)) {
      list.unshift(pinned);
    }
    return list;
  }, [data, pinned]);

  /** Da chiamare al cambio selezione: aggancia l'opzione scelta così resta visibile. */
  const handleSelect = useCallback(
    (value: string) => {
      const match = options.find((o) => o.value === value);
      setPinned(match ?? null);
    },
    [options]
  );

  const reset = useCallback(() => {
    setSearch('');
    setPinned(null);
  }, []);

  return {
    search,
    setSearch,
    options,
    isLoading: enabled ? isLoading : false,
    error,
    handleSelect,
    reset,
    mutate,
  };
}