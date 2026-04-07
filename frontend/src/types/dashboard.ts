import { BookingStatus, TransactionType } from './enums';

export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface BookingStats {
  total: number;
  confirmed: number;
  cancelled: number;
  rescheduled: number;
  completed: number;
  month: string;
}

export interface Booking {
  id: string;
  date: string;
  type: string;
  status: BookingStatus;
  price?: number;
  deposit?: number;
  duration?: number;
  notes?: string;
  customerId: string;
  artistId: string;
  customer?: {
    firstName: string;
    lastName: string;
  };
  artist?: {
    name: string;
    color?: string;
  };
}

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  date: string;
  createdAt: string;
}

export interface TrendEntry {
  month: string;
  income: number;
  expense: number;
}

export interface ArtistPerformance {
  artistId: string;
  _count: { id: number };
  _sum: { price: number | null };
}
