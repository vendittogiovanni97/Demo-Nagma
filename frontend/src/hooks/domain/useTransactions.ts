"use client";

import useSWR from 'swr';

import { ENDPOINTS } from '@/api/endpoints';
import { transactionService } from '@/services/transaction.service';
import type { FinanceSummary, Transaction } from '@/types/transaction';
import type { PaginatedResponse } from '@/types/pagination';

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
  return useSWR<PaginatedResponse<Transaction>>(
    enabled ? [ENDPOINTS.TRANSACTIONS.BASE, type, month, search, page, limit] : null,
    () => transactionService.getAll({ type, month, search, page, limit })
  );
}

export function useTransactionSummary(month?: string, enabled = true) {
  return useSWR<FinanceSummary>(
    enabled ? [ENDPOINTS.TRANSACTIONS.SUMMARY, month] : null,
    () => transactionService.getSummary(month)
  );
}
