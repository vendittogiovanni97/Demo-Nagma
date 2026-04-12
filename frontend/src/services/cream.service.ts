import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Cream, CreateCreamData, CreamSale, CreateCreamSaleData } from '@/types/cream';
import type { PaginatedResponse } from '@/types/pagination';

export const creamService = {
  getAll: async ({
    search,
    stockStatus,
    page = 1,
    limit = 12,
  }: {
    search?: string;
    stockStatus?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<Cream>> => {
    return apiClient.get<PaginatedResponse<Cream>>(ENDPOINTS.CREAMS.BASE, {
      search,
      stockStatus,
      page,
      limit,
    });
  },
  create: async (data: CreateCreamData) => {
    return apiClient.post(ENDPOINTS.CREAMS.BASE, data);
  },
  update: async (id: string, data: Partial<CreateCreamData>) => {
    return apiClient.put(ENDPOINTS.CREAMS.BY_ID(id), data);
  },
  delete: async (id: string) => {
    return apiClient.delete(ENDPOINTS.CREAMS.BY_ID(id));
  },
  getSales: async (sellerId?: string, month?: string): Promise<CreamSale[]> => {
    return apiClient.get<CreamSale[]>(ENDPOINTS.CREAMS.SALES, { sellerId, month });
  },
  registerSale: async (data: CreateCreamSaleData) => {
    return apiClient.post(ENDPOINTS.CREAMS.SALES, data);
  },
};
