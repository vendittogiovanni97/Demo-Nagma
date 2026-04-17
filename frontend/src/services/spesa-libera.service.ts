import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { SpesaLibera, CreateSpesaLiberaData } from '@/types/spesa-libera';

export const spesaLiberaService = {
  getAll: (): Promise<SpesaLibera[]> =>
    apiClient.get<{ data: SpesaLibera[] }>(ENDPOINTS.SPESE_LIBERE.BASE)
      .then(res => res.data),

  create: (data: CreateSpesaLiberaData): Promise<SpesaLibera> =>
    apiClient.post<{ data: SpesaLibera }>(ENDPOINTS.SPESE_LIBERE.BASE, data)
      .then(res => res.data),

  delete: (id: number): Promise<void> =>
    apiClient.delete<void>(ENDPOINTS.SPESE_LIBERE.BY_ID(id)),
};
