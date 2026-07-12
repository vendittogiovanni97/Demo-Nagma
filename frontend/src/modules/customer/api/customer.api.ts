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
    return apiClient.get<CustomerDTO>(ENDPOINTS.CUSTOMERS.BY_ID(id));
  },

  getSummary: async (id: number) => {
    return apiClient.get<CustomerSummaryDTO>(ENDPOINTS.CUSTOMERS.SUMMARY(id));
  },

  create: async (data: CreateCustomerRequest) => {
    return apiClient.post<CustomerDTO>(ENDPOINTS.CUSTOMERS.BASE, data);
  },

  update: async (id: number, data: UpdateCustomerRequest) => {
    return apiClient.put<CustomerDTO>(ENDPOINTS.CUSTOMERS.BY_ID(id), data);
  },

  delete: async (id: number) => {
    return apiClient.delete<void>(ENDPOINTS.CUSTOMERS.BY_ID(id));
  }
};
