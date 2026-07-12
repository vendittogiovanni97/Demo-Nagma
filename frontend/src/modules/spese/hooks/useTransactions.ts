"use client";

import { useEffect, useState, useCallback } from 'react';
import { transactionApi } from '../api/transaction.api';
import { spesaLiberaApi } from '../api/spesa-libera.api';
import type { FinanceSummary, Transaction, SpesaLibera } from '../model/spese.types';
import type { PaginatedResponse } from '@/common/shared/types/pagination';

interface UseTransactionsOptions {
  month?: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useTransactions({
  month,
  type,
  search,
  page = 1,
  limit = 20,
  enabled = true,
}: UseTransactionsOptions = {}) {
  const [data, setData] = useState<PaginatedResponse<Transaction> | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    try {
      const res = await transactionApi.getAll({ type, month, search, page, limit });
      setData(res);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [month, type, search, page, limit, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, mutate: fetchData };
}

export function useTransactionSummary(month?: string, enabled = true) {
  const [data, setData] = useState<FinanceSummary | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    try {
      const res = await transactionApi.getSummary(month);
      setData(res);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [month, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, mutate: fetchData };
}

export function useSpeseLibere(monthStr: string) {
  const [data, setData] = useState<SpesaLibera[] | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchData = useCallback(async () => {
    if (!monthStr) return;
    setIsLoading(true);
    try {
      const res = await spesaLiberaApi.getAll(monthStr);
      setData(res);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [monthStr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, mutate: fetchData };
}
