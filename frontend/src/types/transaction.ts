export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  date: string;
  artistId?: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface CreateTransactionData {
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  date?: string;
  artistId?: string;
}

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
  artistId: string;
  artistName: string;
  artistColor: string | null;
  bookings: number;
  revenue: number;
}
