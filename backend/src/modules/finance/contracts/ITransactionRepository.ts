import { Transaction, TransactionType } from '../domain/Transaction';
import { IPaginatedResponse } from '../../../shared/kernel/interfaces';

export interface TransactionFilters {
  type?: TransactionType;
  month?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ITransactionRepository {
  findAllPaged(filters: TransactionFilters): Promise<IPaginatedResponse<Transaction>>;
  create(transaction: Transaction): Promise<Transaction>;
  delete(id: number): Promise<void>;
  getSummary(month?: string): Promise<{ totalIncome: number; totalExpense: number }>;
  getTrends(startDate: Date, endDate: Date): Promise<Array<{ month: string; income: number; expense: number }>>;
  getArtistPerformance(month?: string): Promise<Array<{ artistId: number; artistName: string; artistColor: string | null; bookings: number; revenue: number }>>;
}
