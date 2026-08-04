import { apiClient } from '@/common/shared/api/client';
import { ENDPOINTS } from '@/common/shared/api/endpoints';
import type { EntrataLibera, CreateEntrataLiberaData } from '../model/entrate.types';

export const entrataLiberaApi = {
  getAll: (month?: string): Promise<EntrataLibera[]> =>
    apiClient.get<{ data: EntrataLibera[] }>(ENDPOINTS.ENTRATE_LIBERE.BASE, month ? { month } : undefined)
      .then(res => res.data),

  create: (data: CreateEntrataLiberaData): Promise<EntrataLibera> =>
    apiClient.post<{ data: EntrataLibera }>(ENDPOINTS.ENTRATE_LIBERE.BASE, data)
      .then(res => res.data),

  delete: (id: number): Promise<void> =>
    apiClient.delete<void>(ENDPOINTS.ENTRATE_LIBERE.BY_ID(id)),
};
