"use client";

import useSWR from 'swr';

import { ENDPOINTS } from '@/api/endpoints';
import { creamService } from '@/services/cream.service';
import type { Cream } from '@/types/cream';
import type { PaginatedResponse } from '@/types/pagination';

interface HookOptions {
  search?: string;
  stockStatus?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useCreams({
  search,
  stockStatus,
  page = 1,
  limit = 12,
  enabled = true,
}: HookOptions = {}) {
  const isEnabled = enabled ?? true;

  return useSWR<PaginatedResponse<Cream>>(
    isEnabled ? [ENDPOINTS.CREAMS.BASE, search, stockStatus, page, limit] : null,
    () => creamService.getAll({ search, stockStatus, page, limit })
  );
}
