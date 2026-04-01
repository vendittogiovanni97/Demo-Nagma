import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';

export interface Cream {
  id: string;
  name: string;
  brand?: string;
  price: number;
  stock: number;
}

export const creamService = {
  getAll: async (): Promise<Cream[]> => {
    return apiClient.get<Cream[]>(ENDPOINTS.CREAMS.BASE);
  },
  create: async (data: any) => {
    return apiClient.post(ENDPOINTS.CREAMS.BASE, data);
  },
  update: async (id: string, data: any) => {
    return apiClient.put(ENDPOINTS.CREAMS.BY_ID(id), data);
  },
  getSales: async (sellerId?: string, month?: string) => {
    return apiClient.get(ENDPOINTS.CREAMS.SALES, { sellerId, month });
  },
  registerSale: async (data: any) => {
    return apiClient.post(ENDPOINTS.CREAMS.SALES, data);
  },
};
