import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Cream, CreateCreamData, CreamSale, CreateCreamSaleData } from '@/types';

export const creamService = {
  getAll: async (): Promise<Cream[]> => {
    return apiClient.get<Cream[]>(ENDPOINTS.CREAMS.BASE);
  },
  create: async (data: CreateCreamData) => {
    return apiClient.post(ENDPOINTS.CREAMS.BASE, data);
  },
  update: async (id: string, data: Partial<CreateCreamData>) => {
    return apiClient.put(ENDPOINTS.CREAMS.BY_ID(id), data);
  },
  getSales: async (sellerId?: string, month?: string): Promise<CreamSale[]> => {
    return apiClient.get<CreamSale[]>(ENDPOINTS.CREAMS.SALES, { sellerId, month });
  },
  registerSale: async (data: CreateCreamSaleData) => {
    return apiClient.post(ENDPOINTS.CREAMS.SALES, data);
  },
};
