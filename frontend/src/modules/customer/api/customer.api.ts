import { httpClient } from '@/shared/api/httpClient';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { CustomerDTO, CustomerSummaryDTO, CreateCustomerRequest, UpdateCustomerRequest } from './customer.types';
import type { PaginatedResponse } from '@/shared/types/pagination';

export const customerApi = {
  getAll: async (params: {
    search?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    return httpClient.get<PaginatedResponse<CustomerDTO>>(ENDPOINTS.CUSTOMERS.BASE, params);
  },

  getById: async (id: number) => {
    return httpClient.get<CustomerDTO>(ENDPOINTS.CUSTOMERS.BY_ID(id));
  },

  getSummary: async (id: number) => {
    return httpClient.get<CustomerSummaryDTO>(ENDPOINTS.CUSTOMERS.SUMMARY(id));
  },

  create: async (data: CreateCustomerRequest) => {
    return httpClient.post<CustomerDTO>(ENDPOINTS.CUSTOMERS.BASE, data);
  },

  update: async (id: number, data: UpdateCustomerRequest) => {
    return httpClient.put<CustomerDTO>(ENDPOINTS.CUSTOMERS.BY_ID(id), data);
  },

  delete: async (id: number) => {
    return httpClient.delete<void>(ENDPOINTS.CUSTOMERS.BY_ID(id));
  }
};
