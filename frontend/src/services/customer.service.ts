import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import { Customer } from '@/types/customer';
import { PaginatedResponse } from '@/types/pagination';

export const customerService = {
  getAll: (search?: string, page = 1, limit = 20): Promise<PaginatedResponse<Customer>> =>
    apiClient.get(ENDPOINTS.CUSTOMERS.BASE, { search, page, limit }),

  getById: (id: string): Promise<Customer> =>
    apiClient.get(ENDPOINTS.CUSTOMERS.BY_ID(id)),

  create: (data: Partial<Customer>) =>
    apiClient.post(ENDPOINTS.CUSTOMERS.BASE, data),

  update: (id: string, data: Partial<Customer>) =>
    apiClient.put(ENDPOINTS.CUSTOMERS.BY_ID(id), data),

  delete: (id: string) =>
    apiClient.delete(ENDPOINTS.CUSTOMERS.BY_ID(id)),
};
