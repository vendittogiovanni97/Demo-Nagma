import { useState, useEffect, useCallback } from 'react';
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
  const { enabled = true, ...apiParams } = params;
  
  const [data, setData] = useState<PaginatedResponse<CustomerModel> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCustomers = useCallback(async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await customerApi.getAll(apiParams);
      setData({
        ...response,
        data: response.data.map(customerMapper.toModel),
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [enabled, JSON.stringify(apiParams)]); // Assuming params are simple primitives

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    data,
    isLoading,
    error,
    mutate: fetchCustomers
  };
}

export function useCustomer(id?: number) {
  const [data, setData] = useState<CustomerModel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCustomer = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await customerApi.getById(id);
      setData(customerMapper.toModel(response));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  return {
    data,
    isLoading,
    error,
    mutate: fetchCustomer
  };
}

export function useCustomerSummary(id?: number) {
  const [data, setData] = useState<CustomerSummaryModel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await customerApi.getSummary(id);
      setData(customerMapper.toSummaryModel(response));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    data,
    isLoading,
    error,
    mutate: fetchSummary
  };
}
