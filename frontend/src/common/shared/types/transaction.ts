import type { PaginatedResponse } from './pagination';

export type TransactionType = 'ENTRATA' | 'USCITA';
export type TransactionFilterType = TransactionType | 'ALL';

export interface Transaction {
  id: number;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  date: string;
  sourceId?: number | null;
  sourceType?: string | null;
  artistName?: string | null;
  studioPercentage?: number | null;
  bookingNotes?: string | null;
  attachmentUrl?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface TransactionParams {
  page?: number;
  limit?: number;
  type?: TransactionType;
  category?: string;
  search?: string;
  month?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: string | number | undefined;
}

export type TransactionAuditData = Record<string, unknown>;

export interface TransactionHistory {
  id: number;
  transactionId: number;
  action: string;
  oldData: TransactionAuditData | null;
  newData: TransactionAuditData | null;
  changedById: number | null;
  changedAt: string;
  changedBy?: { id: number; name: string } | null;
  transaction?: { id: number; description: string; type: TransactionType };
}

export interface CreateTransactionData {
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  date?: string;
  sourceId?: number;
  sourceType?: string;
}

export type UpdateTransactionData = Partial<CreateTransactionData>;

export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
}

export interface ArtistPerformance {
  artistId: number;
  artistName: string;
  artistColor: string | null;
  bookings: number;
  revenue: number;
}

export type TransactionPage = PaginatedResponse<Transaction>;
export type TransactionHistoryPage = PaginatedResponse<TransactionHistory>;
