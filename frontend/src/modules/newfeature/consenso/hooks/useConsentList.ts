"use client";

import { useState, useEffect, useCallback } from 'react';
import { consensoService } from '../service/consenso.service';
import { ConsentRecord } from '../model/consent-list.types';

export function useConsentList() {
  const [data, setData] = useState<ConsentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await consensoService.getConsents();
      setData(res.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Errore nel caricamento consensi'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, isLoading, error, mutate: fetch };
}
