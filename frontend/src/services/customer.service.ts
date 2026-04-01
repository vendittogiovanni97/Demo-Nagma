import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';

import { Customer } from '@/types/customer';

export const customerService = {
  getAll: async (search?: string): Promise<Customer[]> => {
    return apiClient.get<Customer[]>(ENDPOINTS.CUSTOMERS.BASE, { search });
  },
  getById: async (id: string): Promise<Customer> => {
    return apiClient.get<Customer>(ENDPOINTS.CUSTOMERS.BY_ID(id));
  },
  create: async (data: any) => {
    return apiClient.post(ENDPOINTS.CUSTOMERS.BASE, data);
  },
  update: async (id: string, data: any) => {
    return apiClient.put(ENDPOINTS.CUSTOMERS.BY_ID(id), data);
  },
  delete: async (id: string) => {
    return apiClient.delete(ENDPOINTS.CUSTOMERS.BY_ID(id));
  },
};
