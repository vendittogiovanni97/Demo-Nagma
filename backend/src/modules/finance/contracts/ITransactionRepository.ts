import { Transaction, TransactionType } from '../domain/Transaction';
import { TransactionHistory } from '../domain/TransactionHistory';
import { IPaginatedResponse } from '../../../shared/kernel/interfaces';

export interface TransactionFilters {
  type?: TransactionType;
  month?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TransactionHistoryFilters {
  transactionId?: number;
  changedById?: number;
  startDate?: string;
  endDate?: string;
  action?: string;
}

export interface ITransactionRepository {
  findById(id: number): Promise<Transaction | null>;
  findAllPaged(filters: TransactionFilters): Promise<IPaginatedResponse<Transaction>>;
  create(transaction: Transaction): Promise<Transaction>;
  update(id: number, data: Partial<Transaction>): Promise<Transaction>;
  delete(id: number): Promise<void>;
  deleteBySource(sourceId: number, sourceType: string): Promise<void>;
  
  // History/Audit
  addHistory(history: TransactionHistory): Promise<void>;
  findAllHistoryPaged(page: number, limit: number, filters: TransactionHistoryFilters): Promise<IPaginatedResponse<TransactionHistory>>;
  
  getSummary(month?: string): Promise<{ totalIncome: number; totalExpense: number }>;
  getTrends(startDate: Date, endDate: Date): Promise<Array<{ month: string; income: number; expense: number }>>;
  getArtistPerformance(month?: string): Promise<Array<{ artistId: number; artistName: string; artistColor: string | null; bookings: number; revenue: number }>>;
  
  executeInTransaction<T>(work: (repo: ITransactionRepository, tx: any) => Promise<T>): Promise<T>;
}

