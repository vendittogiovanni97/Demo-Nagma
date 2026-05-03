import { TransactionType } from '../domain/Transaction';

export interface CreateTransactionDTO {
  type: TransactionType;
  category: string;
  description?: string;
  amount: number;
  date?: string;
}

export interface CreateSpesaLiberaDTO {
  name: string;
  price: number;
}

export interface FinanceSummaryDTO {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
