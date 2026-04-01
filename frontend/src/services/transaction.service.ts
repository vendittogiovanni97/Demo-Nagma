import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';

import { FinanceSummary } from '@/types/dashboard';

export const transactionService = {
  getAll: async (type?: string, month?: string) => {
    return apiClient.get<any[]>(ENDPOINTS.TRANSACTIONS.BASE, { type, month });
  },
  getSummary: async (month?: string): Promise<FinanceSummary> => {
    return apiClient.get<FinanceSummary>(ENDPOINTS.TRANSACTIONS.SUMMARY, { month });
  },
  getTrends: async (months: number = 6): Promise<any[]> => {
    return apiClient.get<any[]>(ENDPOINTS.TRANSACTIONS.TRENDS, { months });
  },
  getArtistPerformance: async (): Promise<any[]> => {
    return apiClient.get<any[]>(ENDPOINTS.TRANSACTIONS.PERFORMANCE);
  },
  create: async (data: any) => {
    return apiClient.post(ENDPOINTS.TRANSACTIONS.BASE, data);
  },
  delete: async (id: string) => {
    return apiClient.delete(ENDPOINTS.TRANSACTIONS.BY_ID(id));
  },
};
