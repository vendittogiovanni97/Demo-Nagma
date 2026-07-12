import { apiClient } from '@/common/shared/api/client';
import { ENDPOINTS } from '@/common/shared/api/endpoints';
import { PaginatedResponse } from '@/common/shared/types/pagination';

export interface Transaction {
  id: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  description: string;
  amount: number;
  date: string;
  sourceId?: number;
  sourceType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionHistory {
  id: number;
  transactionId: number;
  action: string;
  oldData: any;
  newData: any;
  changedById: number;
  changedAt: string;
  changedBy?: { id: number; name: string };
  transaction?: { id: number; description: string; type: string };
}

export const financeApi = {
  getAll: (params: any) =>
    apiClient.get<PaginatedResponse<Transaction>>(ENDPOINTS.TRANSACTIONS.BASE, params),

  getSummary: (month?: string) =>
    apiClient.get<{ totalIncome: number; totalExpense: number; balance: number }>(ENDPOINTS.TRANSACTIONS.SUMMARY, { month }),

  getTrends: (months: number = 6) =>
    apiClient.get<Array<{ month: string; income: number; expense: number }>>(ENDPOINTS.TRANSACTIONS.TRENDS, { months }),

  getHistory: (params: any) =>
    apiClient.get<PaginatedResponse<TransactionHistory>>(ENDPOINTS.TRANSACTIONS.HISTORY, params),

  create: (data: any) =>
    apiClient.post<Transaction>(ENDPOINTS.TRANSACTIONS.BASE, data),

  update: (id: number, data: any) =>
    apiClient.patch<Transaction>(ENDPOINTS.TRANSACTIONS.BY_ID(id), data),

  delete: (id: number) =>
    apiClient.delete(ENDPOINTS.TRANSACTIONS.BY_ID(id)),
};

