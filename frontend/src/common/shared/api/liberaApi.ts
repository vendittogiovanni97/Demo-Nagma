import { apiClient } from '@/common/shared/api/client';

export interface LiberaEndpoints {
  BASE: string;
  BY_ID: (id: string | number) => string;
}

/**
 * Factory per le API di movimenti "liberi" (spese/entrate libere): stesso contratto
 * REST, cambiano solo endpoint e tipi. Evita la duplicazione tra spesa/entrata.
 */
export function createLiberaApi<TModel, TCreate>(endpoints: LiberaEndpoints) {
  return {
    getAll: (month?: string): Promise<TModel[]> =>
      apiClient
        .get<{ data: TModel[] }>(endpoints.BASE, month ? { month } : undefined)
        .then((res) => res.data),
    create: (data: TCreate): Promise<TModel> =>
      apiClient.post<{ data: TModel }>(endpoints.BASE, data).then((res) => res.data),
    delete: (id: number): Promise<void> => apiClient.delete<void>(endpoints.BY_ID(id)),
  };
}
