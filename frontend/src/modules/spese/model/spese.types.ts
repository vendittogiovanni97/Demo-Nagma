export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: number;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  date: string;
  artistId?: number;
  attachmentUrl?: string;
  createdAt: string;
}

export interface CreateTransactionData {
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  date?: string;
  artistId?: number;
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
  artistId: number;
  artistName: string;
  artistColor: string | null;
  bookings: number;
  revenue: number;
}

export interface SpesaLibera {
  id: number;
  name: string;
  price: number;
  createdAt: string;
}

export interface CreateSpesaLiberaData {
  name: string;
  price: number;
}
