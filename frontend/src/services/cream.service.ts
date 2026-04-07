import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import { Cream, CreamSale } from '@/types/customer';

interface RegisterSalePayload {
  creamId: string;
  sellerId: string;
  customerId?: string;
  quantity: number;
  totalPrice: number;
}

export const creamService = {
  getAll: (): Promise<Cream[]> =>
    apiClient.get(ENDPOINTS.CREAMS.BASE),

  create: (data: Omit<Cream, 'id'>) =>
    apiClient.post(ENDPOINTS.CREAMS.BASE, data),

  update: (id: string, data: Partial<Omit<Cream, 'id'>>) =>
    apiClient.put(ENDPOINTS.CREAMS.BY_ID(id), data),

  getSales: (sellerId?: string, month?: string): Promise<CreamSale[]> =>
    apiClient.get(ENDPOINTS.CREAMS.SALES, { sellerId, month }),

  registerSale: (data: RegisterSalePayload): Promise<CreamSale> =>
    apiClient.post(ENDPOINTS.CREAMS.SALES, data),
};
