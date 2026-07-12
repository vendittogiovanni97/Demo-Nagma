"use client";

import { useEffect, useState, useCallback } from 'react';
import { whatsappApi } from '../api/whatsapp.api';
import type { PaginatedResponse } from '@/common/shared/types/pagination';
import type { WhatsAppMessageLog, WhatsAppMessageStatus, WhatsAppTemplate } from '../model/whatsapp.types';

interface UseWhatsAppTemplatesOptions {
  search?: string;
  enabled?: boolean;
  startDate?: string;
  endDate?: string;
}

interface UseWhatsAppLogsOptions {
  search?: string;
  status?: WhatsAppMessageStatus | '';
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useWhatsAppTemplates({ search, enabled = true, startDate, endDate }: UseWhatsAppTemplatesOptions = {}) {
  const [data, setData] = useState<WhatsAppTemplate[] | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    try {
      const res = await whatsappApi.getTemplates(search, startDate, endDate);
      setData(res);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [search, enabled, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, mutate: fetchData };
}

export function useWhatsAppLogs({
  search,
  status,
  page = 1,
  limit = 20,
  enabled = true,
}: UseWhatsAppLogsOptions = {}) {
  const [data, setData] = useState<PaginatedResponse<WhatsAppMessageLog> | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    try {
      const res = await whatsappApi.getLogs({ search, status, page, limit });
      setData(res);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [search, status, page, limit, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, mutate: fetchData };
}
