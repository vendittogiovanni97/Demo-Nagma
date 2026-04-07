import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Transaction, CreateTransactionData, FinanceSummary, MonthlyTrend, ArtistPerformance } from '@/types';

export const transactionService = {
  getAll: async (type?: string, month?: string): Promise<Transaction[]> => {
    return apiClient.get<Transaction[]>(ENDPOINTS.TRANSACTIONS.BASE, { type, month });
  },
  getSummary: async (month?: string): Promise<FinanceSummary> => {
    return apiClient.get<FinanceSummary>(ENDPOINTS.TRANSACTIONS.SUMMARY, { month });
  },
  getTrends: async (months: number = 6): Promise<MonthlyTrend[]> => {
    return apiClient.get<MonthlyTrend[]>(ENDPOINTS.TRANSACTIONS.TRENDS, { months });
  },
  getArtistPerformance: async (): Promise<ArtistPerformance[]> => {
    return apiClient.get<ArtistPerformance[]>(ENDPOINTS.TRANSACTIONS.PERFORMANCE);
  },
  create: async (data: CreateTransactionData) => {
    return apiClient.post(ENDPOINTS.TRANSACTIONS.BASE, data);
  },
  delete: async (id: string) => {
    return apiClient.delete(ENDPOINTS.TRANSACTIONS.BY_ID(id));
  },
};
