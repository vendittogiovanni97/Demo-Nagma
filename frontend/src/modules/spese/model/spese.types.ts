export type {
  ArtistPerformance,
  CreateTransactionData,
  FinanceSummary,
  MonthlyTrend,
  Transaction,
  TransactionType,
} from '@/common/shared/types/transaction';

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
