"use client";

import useSWR from 'swr';
import { customerApi } from '../api/customer.api';
import { customerMapper } from '../api/customer.mapper';
import type { CustomerModel, CustomerSummaryModel } from '../model/customer.model';
import type { PaginatedResponse } from '@/common/shared/types/pagination';

interface UseCustomersParams {
  search?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  enabled?: boolean;
}

export function useCustomers(params: UseCustomersParams = {}) {
  const { enabled = true, search, page, limit, startDate, endDate } = params;
  const key = enabled ? ['/api/customers', search, page, limit, startDate, endDate] : null;

  const { data, isLoading, error, mutate } = useSWR<PaginatedResponse<CustomerModel>>(
    key,
    async () => {
      const response = await customerApi.getAll({ search, page, limit, startDate, endDate });
      return {
        ...response,
        data: response.data.map(customerMapper.toModel),
      };
    },
    { keepPreviousData: true }
  );

  return {
    data,
    isLoading,
    error,
    mutate,
  };
}

export function useCustomer(id?: number) {
  const key = id ? ['/api/customers', id] : null;

  const { data, isLoading, error, mutate } = useSWR<CustomerModel>(
    key,
    async () => {
      const response = await customerApi.getById(id!);
      return customerMapper.toModel(response);
    }
  );

  return {
    data,
    isLoading,
    error,
    mutate,
  };
}

export function useCustomerSummary(id?: number) {
  const key = id ? ['/api/customers/summary', id] : null;

  const { data, isLoading, error, mutate } = useSWR<CustomerSummaryModel>(
    key,
    async () => {
      const response = await customerApi.getSummary(id!);
      return customerMapper.toSummaryModel(response);
    }
  );

  return {
    data,
    isLoading,
    error,
    mutate,
  };
}
