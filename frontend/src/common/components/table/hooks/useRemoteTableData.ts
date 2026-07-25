'use client';

import { useId } from 'react';
import useSWR from 'swr';

import type { DataTableResponse, FetchParams } from '../DataTable.types';

interface RemoteTableQuery {
  page: number;
  limit: number;
  search: string;
  orderBy: string | null;
  orderDirection: 'asc' | 'desc';
  refreshKey?: unknown;
}

interface UseRemoteTableDataOptions<E> {
  fetchData?: (params: FetchParams) => Promise<DataTableResponse<E>>;
  query: RemoteTableQuery;
}

export function useRemoteTableData<E>({
  fetchData,
  query,
}: UseRemoteTableDataOptions<E>) {
  const instanceId = useId();
  const swrKey = fetchData
    ? [
        'data-table',
        instanceId,
        query.page,
        query.limit,
        query.search,
        query.orderBy,
        query.orderDirection,
        query.refreshKey,
      ]
    : null;

  const { data, isLoading, mutate } = useSWR(
    swrKey,
    () =>
      fetchData!({
        page: query.page + 1,
        limit: query.limit,
        search: query.search || undefined,
        orderBy: query.orderBy || undefined,
        orderDirection: query.orderDirection,
      }),
    { revalidateOnFocus: false, dedupingInterval: 1000 }
  );

  return {
    data: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading: fetchData ? isLoading : false,
    refresh: mutate,
  };
}
