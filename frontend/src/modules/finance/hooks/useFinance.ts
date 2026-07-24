import useSWR from 'swr';
import { financeApi } from '../api/finance.api';
import { useState } from 'react';
import { format } from 'date-fns';
import { useDebouncedValue } from '@/common/hooks/useDebouncedValue';
import type { TransactionFilterType, TransactionParams } from '@/common/shared/types/transaction';

export function useFinance(initialMonth = new Date()) {
  const [month, setMonth] = useState(initialMonth);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<TransactionFilterType>('ALL');
  const debouncedSearch = useDebouncedValue(search, 400);

  const monthStr = format(month, 'yyyy-MM');

  const { data, isLoading, mutate, error } = useSWR(
    ['/finance/transactions', monthStr, page, debouncedSearch, type],
    () => financeApi.getAll({ 
      month: monthStr, 
      page, 
      search: debouncedSearch, 
      type: type === 'ALL' ? undefined : type 
    })
  );

  const { data: summary, isLoading: isLoadingSummary, mutate: mutateSummary } = useSWR(
    ['/finance/transactions/summary', monthStr],
    () => financeApi.getSummary(monthStr)
  );

  return {
    transactions: data?.data ?? [],
    total: data?.total ?? 0,
    summary,
    isLoading: isLoading || isLoadingSummary,
    error,
    page,
    setPage,
    search,
    setSearch,
    month,
    setMonth,
    type,
    setType,
    refresh: () => { mutate(); mutateSummary(); }
  };
}

export function useFinanceHistory(filters: TransactionParams = {}) {
  const [page, setPage] = useState(1);
  
  const { data, isLoading, mutate } = useSWR(
    ['/finance/transactions/history', page, JSON.stringify(filters)],
    () => financeApi.getHistory({ ...filters, page })
  );

  return {
    history: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    page,
    setPage,
    refresh: mutate
  };
}
