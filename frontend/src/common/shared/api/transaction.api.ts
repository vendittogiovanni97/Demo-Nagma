import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import type {
  ArtistPerformance,
  CreateTransactionData,
  FinanceSummary,
  MonthlyTrend,
  Transaction,
  TransactionHistoryPage,
  TransactionPage,
  TransactionParams,
  UpdateTransactionData,
} from '@/common/shared/types/transaction';

export const transactionApi = {
  getAll: (params: TransactionParams = {}): Promise<TransactionPage> =>
    apiClient.get<TransactionPage>(ENDPOINTS.TRANSACTIONS.BASE, {
      page: 1,
      limit: 25,
      ...params,
    }),

  getSummary: (month?: string): Promise<FinanceSummary> =>
    apiClient.get<FinanceSummary>(ENDPOINTS.TRANSACTIONS.SUMMARY, { month }),

  getTrends: (months = 6): Promise<MonthlyTrend[]> =>
    apiClient.get<MonthlyTrend[]>(ENDPOINTS.TRANSACTIONS.TRENDS, { months }),

  getArtistPerformance: (): Promise<ArtistPerformance[]> =>
    apiClient.get<ArtistPerformance[]>(ENDPOINTS.TRANSACTIONS.PERFORMANCE),

  getHistory: (params: TransactionParams = {}): Promise<TransactionHistoryPage> =>
    apiClient.get<TransactionHistoryPage>(ENDPOINTS.TRANSACTIONS.HISTORY, params),

  create: (data: CreateTransactionData): Promise<Transaction> =>
    apiClient.post<Transaction>(ENDPOINTS.TRANSACTIONS.BASE, data),

  update: (id: number, data: UpdateTransactionData): Promise<Transaction> =>
    apiClient.patch<Transaction>(ENDPOINTS.TRANSACTIONS.BY_ID(id), data),

  delete: (id: number): Promise<void> =>
    apiClient.delete<void>(ENDPOINTS.TRANSACTIONS.BY_ID(id)),
};
