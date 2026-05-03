import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

export interface Cream {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreamSale {
  id: number;
  creamId: number;
  artistId: number;
  artist: { id: number; name: string; color: string };
  quantity: number;
  soldAt: string;
}

export interface CreamSaleInput {
  creamId: number;
  artistId: number;
  quantity: number;
}

export const creamService = {
  getActive: async (): Promise<Cream> => {
    return apiClient.get<Cream>(ENDPOINTS.CREAM.BASE);
  },
  create: async (data: { name: string; description?: string; isActive?: boolean }) => {
    return apiClient.post(ENDPOINTS.CREAM.BASE, data);
  },
  getSales: async (creamId: number, page = 1, limit = 20, filters?: { startDate?: string; endDate?: string; artistId?: number }) => {
    return apiClient.get<{ data: CreamSale[]; total: number; page: number; limit: number; totalPages: number }>(
      `${ENDPOINTS.CREAM.BASE}/${creamId}/sales`,
      { page, limit, ...filters }
    );
  },
  createSale: async (data: CreamSaleInput) => {
    return apiClient.post(ENDPOINTS.CREAM.SALES, data);
  },
  getSalesSummary: async () => {
    return apiClient.get<{ id: number; name: string; color: string; totalSales: number; totalQuantity: number }[]>(
      ENDPOINTS.CREAM.SUMMARY
    );
  },
};