import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Customer, CreateCustomerData } from '@/types';

export const customerService = {
  getAll: async (search?: string): Promise<Customer[]> => {
    const res = await apiClient.get<{ data: Customer[] }>(ENDPOINTS.CUSTOMERS.BASE, { search });
    return res.data;
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
