"use client";

import useSWR from 'swr';

import { ENDPOINTS } from '@/api/endpoints';
import { customerService } from '@/services/customer.service';
import type { Customer } from '@/types/customer';
import type { PaginatedResponse } from '@/types/pagination';

interface UseCustomersOptions {
  search?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useCustomers({ search, page = 1, limit = 20, enabled = true }: UseCustomersOptions = {}) {
  return useSWR<PaginatedResponse<Customer>>(
    enabled ? [ENDPOINTS.CUSTOMERS.BASE, search, page, limit] : null,
    () => customerService.getAll(search, page, limit)
  );
}
