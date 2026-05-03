import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { Transaction, CreateTransactionData, FinanceSummary, MonthlyTrend, ArtistPerformance } from '../model/spese.types';
import type { PaginatedResponse } from '@/shared/types/pagination';

export const transactionApi = {
  getAll: async ({
    type,
    month,
    search,
    page = 1,
    limit = 20,
  }: {
    type?: string;
    month?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<Transaction>> => {
    return apiClient.get<PaginatedResponse<Transaction>>(ENDPOINTS.TRANSACTIONS.BASE, {
      type,
      month,
      search,
      page,
      limit,
    });
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
  delete: async (id: number) => {
    return apiClient.delete(ENDPOINTS.TRANSACTIONS.BY_ID(id));
  },
};
