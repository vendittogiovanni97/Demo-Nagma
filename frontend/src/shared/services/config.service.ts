import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

export interface SystemConfig {
  success: boolean;
  SHOW_CONSENSI: boolean;
  SHOW_POSIZIONAMENTO: boolean;
  DEFAULT_PHONE_PREFIX: string;
}

export const configService = {
  getConfig: async () => {
    return apiClient.get<SystemConfig>(ENDPOINTS.CONFIG.BASE);
  },

  updateConfig: async (data: { SHOW_CONSENSI?: boolean; SHOW_POSIZIONAMENTO?: boolean; DEFAULT_PHONE_PREFIX?: string }) => {
    return apiClient.post<{ success: boolean; message: string }>(ENDPOINTS.CONFIG.BASE, data);
  }
};
