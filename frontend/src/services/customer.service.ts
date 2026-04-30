import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { CreateCustomerData, Customer, CustomerSummary } from '@/types/customer';
import type { PaginatedResponse } from '@/types/pagination';

export const customerService = {
  getAll: async (
    search?: string,
    page: number = 1,
    limit: number = 20,
    startDate?: string,
    endDate?: string
  ): Promise<PaginatedResponse<Customer>> => {
    return apiClient.get<PaginatedResponse<Customer>>(ENDPOINTS.CUSTOMERS.BASE, { search, page, limit, startDate, endDate });
  },
  getById: async (id: number): Promise<Customer> => {
    return apiClient.get<Customer>(ENDPOINTS.CUSTOMERS.BY_ID(id));
  },
  getSummary: async (id: number): Promise<CustomerSummary> => {
    return apiClient.get<CustomerSummary>(ENDPOINTS.CUSTOMERS.SUMMARY(id));
  },
  create: async (data: CreateCustomerData): Promise<Customer> => {
    return apiClient.post<Customer>(ENDPOINTS.CUSTOMERS.BASE, data);
  },
  update: async (id: number, data: Partial<CreateCustomerData>): Promise<Customer> => {
    return apiClient.put<Customer>(ENDPOINTS.CUSTOMERS.BY_ID(id), data);
  },
  delete: async (id: number): Promise<void> => {
    return apiClient.delete(ENDPOINTS.CUSTOMERS.BY_ID(id));
  },
};
