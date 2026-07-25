'use client';

import type { GridApi } from 'ag-grid-community';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  getPreferredItemsPerPage,
  PAGE_SIZE_OPTIONS,
  setPreferredItemsPerPage,
} from '@/common/shared/utils/pagination';

interface UseTablePaginationOptions {
  gridApiRef: React.RefObject<GridApi | null>;
  remote: boolean;
  localTotal: number;
  search: string;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

export function useTablePagination({
  gridApiRef,
  remote,
  localTotal,
  search,
  initialPageSize,
  pageSizeOptions,
}: UseTablePaginationOptions) {
  const preferredPageSize = useMemo(getPreferredItemsPerPage, []);
  const [remotePage, setRemotePageState] = useState(0);
  const [remoteLimit, setRemoteLimitState] = useState(preferredPageSize);
  const [localPage, setLocalPage] = useState(0);
  const [localLimit, setLocalLimit] = useState(initialPageSize ?? preferredPageSize);
  const [displayedLocalTotal, setDisplayedLocalTotal] = useState(localTotal);

  const setRemotePage = useCallback((page: number) => {
    setRemotePageState(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const setLimitPreference = useCallback((limit: number) => {
    setPreferredItemsPerPage(limit);
    setRemoteLimitState(limit);
  }, []);

  const currentLimit = remote ? remoteLimit : localLimit;
  const options = useMemo(() => {
    const configured = pageSizeOptions ?? [...PAGE_SIZE_OPTIONS];
    return configured.includes(currentLimit)
      ? configured
      : [...configured, currentLimit].sort((left, right) => left - right);
  }, [currentLimit, pageSizeOptions]);

  const syncLocalPagination = useCallback(() => {
    if (remote) return;
    const api = gridApiRef.current;
    setLocalPage(api?.paginationGetCurrentPage() ?? 0);
    setDisplayedLocalTotal(api?.getDisplayedRowCount() ?? localTotal);
  }, [gridApiRef, localTotal, remote]);

  useEffect(() => {
    if (remote) return;
    setDisplayedLocalTotal(localTotal);
    const lastPage = Math.max(0, Math.ceil(localTotal / localLimit) - 1);
    if (localPage > lastPage) {
      setLocalPage(lastPage);
      gridApiRef.current?.paginationGoToPage(lastPage);
    }
  }, [gridApiRef, localLimit, localPage, localTotal, remote]);

  useEffect(() => {
    if (remote) return;
    setLocalPage(0);
    gridApiRef.current?.paginationGoToFirstPage();
  }, [gridApiRef, remote, search]);

  const onPageChange = useCallback(
    (_event: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
      if (remote) {
        setRemotePage(page);
        return;
      }
      setLocalPage(page);
      gridApiRef.current?.paginationGoToPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [gridApiRef, remote, setRemotePage]
  );

  const onPageSizeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const limit = Number.parseInt(event.target.value, 10);
      setLimitPreference(limit);
      if (!remote) {
        setLocalLimit(limit);
        setLocalPage(0);
        gridApiRef.current?.setGridOption('paginationPageSize', limit);
        gridApiRef.current?.paginationGoToFirstPage();
      }
    },
    [gridApiRef, remote, setLimitPreference]
  );

  return {
    remotePage,
    remoteLimit,
    setRemotePage,
    page: remote ? remotePage : localPage,
    limit: currentLimit,
    localCount: displayedLocalTotal,
    pageSizeOptions: options,
    syncLocalPagination,
    onPageChange,
    onPageSizeChange,
  };
}
