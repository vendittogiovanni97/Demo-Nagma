import { apiClient } from '@/common/shared/api/client';
import { ENDPOINTS } from '@/common/shared/api/endpoints';
import type { SpesaLibera, CreateSpesaLiberaData } from '../model/spese.types';

export const spesaLiberaApi = {
  getAll: (month?: string): Promise<SpesaLibera[]> =>
    apiClient.get<{ data: SpesaLibera[] }>(ENDPOINTS.SPESE_LIBERE.BASE, month ? { month } : undefined)
      .then(res => res.data),

  create: (data: CreateSpesaLiberaData): Promise<SpesaLibera> =>
    apiClient.post<{ data: SpesaLibera }>(ENDPOINTS.SPESE_LIBERE.BASE, data)
      .then(res => res.data),

  delete: (id: number): Promise<void> =>
    apiClient.delete<void>(ENDPOINTS.SPESE_LIBERE.BY_ID(id)),
};
