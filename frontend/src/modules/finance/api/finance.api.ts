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

/** Query params per la lista transazioni paginata */
export interface TransactionParams {
  page?: number;
  limit?: number;
  type?: 'INCOME' | 'EXPENSE';
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: string | number | undefined; // campi aggiuntivi del filtro
}

/** Dati storici di audit — struttura variabile per design */
export type TransactionAuditData = Record<string, unknown>;

export interface TransactionHistory {
  id: number;
  transactionId: number;
  action: string;
  oldData: TransactionAuditData;
  newData: TransactionAuditData;
  changedById: number;
  changedAt: string;
  changedBy?: { id: number; name: string };
  transaction?: { id: number; description: string; type: string };
}

export interface CreateTransactionData {
  type: 'INCOME' | 'EXPENSE';
  category: string;
  description: string;
  amount: number;
  date: string;
  sourceId?: number;
  sourceType?: string;
}

export type UpdateTransactionData = Partial<CreateTransactionData>;

export const financeApi = {
  getAll: (params: TransactionParams) =>
    apiClient.get<PaginatedResponse<Transaction>>(ENDPOINTS.TRANSACTIONS.BASE, params),

  getSummary: (month?: string) =>
    apiClient.get<{ totalIncome: number; totalExpense: number; balance: number }>(ENDPOINTS.TRANSACTIONS.SUMMARY, { month }),

  getTrends: (months: number = 6) =>
    apiClient.get<Array<{ month: string; income: number; expense: number }>>(ENDPOINTS.TRANSACTIONS.TRENDS, { months }),

  getHistory: (params: TransactionParams) =>
    apiClient.get<PaginatedResponse<TransactionHistory>>(ENDPOINTS.TRANSACTIONS.HISTORY, params),

  create: (data: CreateTransactionData) =>
    apiClient.post<Transaction>(ENDPOINTS.TRANSACTIONS.BASE, data),

  update: (id: number, data: UpdateTransactionData) =>
    apiClient.patch<Transaction>(ENDPOINTS.TRANSACTIONS.BY_ID(id), data),

  delete: (id: number) =>
    apiClient.delete(ENDPOINTS.TRANSACTIONS.BY_ID(id)),
};
