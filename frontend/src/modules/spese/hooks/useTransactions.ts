"use client";

import useSWR from 'swr';
import { transactionApi } from '../api/transaction.api';
import { spesaLiberaApi } from '../api/spesa-libera.api';
import type { FinanceSummary, Transaction, SpesaLibera } from '../model/spese.types';
import type { TransactionType } from '@/common/shared/types/transaction';
import type { PaginatedResponse } from '@/common/shared/types/pagination';

interface UseTransactionsOptions {
  month?: string;
  type?: TransactionType;
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
  limit = 25,
  enabled = true,
}: UseTransactionsOptions = {}) {
  const key = enabled ? ['/api/finance/transactions', month, type, search, page, limit] : null;

  const { data, isLoading, error, mutate } = useSWR<PaginatedResponse<Transaction>>(
    key,
    () => transactionApi.getAll({ type, month, search, page, limit })
  );

  return { data, isLoading, error, mutate };
}

export function useTransactionSummary(month?: string, enabled = true) {
  const { data, isLoading, error, mutate } = useSWR<FinanceSummary>(
    enabled ? ['/api/finance/transactions/summary', month] : null,
    () => transactionApi.getSummary(month),
  );

  return { data, isLoading, error, mutate };
}

export function useSpeseLibere(monthStr: string) {
  const key = monthStr ? ['/api/finance/spese-libere', monthStr] : null;

  const { data, isLoading, error, mutate } = useSWR<SpesaLibera[]>(
    key,
    () => spesaLiberaApi.getAll(monthStr)
  );

  return { data, isLoading, error, mutate };
}
