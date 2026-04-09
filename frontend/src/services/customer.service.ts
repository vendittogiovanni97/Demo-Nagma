import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Customer, CreateCustomerData } from '@/types';

interface PaginatedCustomers {
  data: Customer[];
  total: number;
  page: number;
  totalPages: number;
}

export const customerService = {
  getAll: async (search?: string, page: number = 1): Promise<PaginatedCustomers> => {
    return apiClient.get<PaginatedCustomers>(ENDPOINTS.CUSTOMERS.BASE, { search, page });
  },
  getById: async (id: string): Promise<Customer> => {
    return apiClient.get<Customer>(ENDPOINTS.CUSTOMERS.BY_ID(id));
  },
  create: async (data: CreateCustomerData) => {
    return apiClient.post(ENDPOINTS.CUSTOMERS.BASE, data);
  },
  update: async (id: string, data: Partial<CreateCustomerData>) => {
    return apiClient.put(ENDPOINTS.CUSTOMERS.BY_ID(id), data);
  },
  delete: async (id: string) => {
    return apiClient.delete(ENDPOINTS.CUSTOMERS.BY_ID(id));
  },
};
