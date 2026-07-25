import { apiClient } from '@/common/shared/api/client';
import { ENDPOINTS } from '@/common/shared/api/endpoints';
import type { CustomerDTO, CustomerSummaryDTO, CreateCustomerRequest, UpdateCustomerRequest } from './customer.types';
import type { PaginatedResponse } from '@/common/shared/types/pagination';

export const customerApi = {
  getAll: async (params: {
    search?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    return apiClient.get<PaginatedResponse<CustomerDTO>>(ENDPOINTS.CUSTOMERS.BASE, params);
  },

  getById: async (id: number) => {
    const res = await apiClient.get<{ success: boolean; data: CustomerDTO }>(
      ENDPOINTS.CUSTOMERS.BY_ID(id)
    );
    return res.data;
  },

  getSummary: async (id: number) => {
    const res = await apiClient.get<{ success: boolean; data: CustomerSummaryDTO }>(
      ENDPOINTS.CUSTOMERS.SUMMARY(id)
    );
    return res.data;
  },

  create: async (data: CreateCustomerRequest) => {
    const res = await apiClient.post<{ success: boolean; data: CustomerDTO }>(
      ENDPOINTS.CUSTOMERS.BASE,
      data
    );
    return res.data;
  },

  update: async (id: number, data: UpdateCustomerRequest) => {
    const res = await apiClient.put<{ success: boolean; data: CustomerDTO }>(
      ENDPOINTS.CUSTOMERS.BY_ID(id),
      data
    );
    return res.data;
  },

  delete: async (id: number) => {
    return apiClient.delete<void>(ENDPOINTS.CUSTOMERS.BY_ID(id));
  }
};
