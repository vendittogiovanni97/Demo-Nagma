"use client";

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { ConsentRecord } from '../model/consent-list.types';

export function useConsentList() {
  const [data, setData] = useState<ConsentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<{ success: boolean; data: ConsentRecord[] }>(
        ENDPOINTS.NEW_FEATURE.GET_CONSENTS
      );
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
