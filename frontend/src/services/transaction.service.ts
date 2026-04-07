import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import { FinanceSummary, Transaction, TrendEntry, ArtistPerformance } from '@/types/dashboard';

export const transactionService = {
  getAll: (type?: string, month?: string): Promise<Transaction[]> =>
    apiClient.get(ENDPOINTS.TRANSACTIONS.BASE, { type, month }),

  getSummary: (month?: string): Promise<FinanceSummary> =>
    apiClient.get(ENDPOINTS.TRANSACTIONS.SUMMARY, { month }),

  getTrends: (months = 6): Promise<TrendEntry[]> =>
    apiClient.get(ENDPOINTS.TRANSACTIONS.TRENDS, { months }),

  getArtistPerformance: (): Promise<ArtistPerformance[]> =>
    apiClient.get(ENDPOINTS.TRANSACTIONS.PERFORMANCE),

  create: (data: Pick<Transaction, 'type' | 'category' | 'description' | 'amount'> & { date?: string }) =>
    apiClient.post(ENDPOINTS.TRANSACTIONS.BASE, data),

  delete: (id: string) =>
    apiClient.delete(ENDPOINTS.TRANSACTIONS.BY_ID(id)),
};
