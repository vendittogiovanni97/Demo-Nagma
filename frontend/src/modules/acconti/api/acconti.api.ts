import { apiClient } from '@/common/shared/api/client';
import { ENDPOINTS } from '@/common/shared/api/endpoints';
import type { TransactionPage } from '@/common/shared/types/transaction';
import type { AccontiFilters } from '../model/acconti.types';

export const accontiApi = {
  getAll: (params: AccontiFilters = {}): Promise<TransactionPage> =>
    apiClient.get<TransactionPage>(ENDPOINTS.TRANSACTIONS.BASE, {
      page: 1,
      limit: 25,
      ...params,
      type: 'ENTRATA',
      category: 'Acconto',
    }),
};
