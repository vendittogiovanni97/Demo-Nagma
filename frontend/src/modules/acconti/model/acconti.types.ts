import type { Transaction } from '@/common/shared/types/transaction';

// Gli acconti sono Transaction con category === 'Acconto' e type === 'ENTRATA'
export type Acconto = Transaction;

export interface AccontiFilters {
  month?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}
