import { apiClient } from '@/common/shared/api/client';
import { API_BASE_URL, ENDPOINTS } from '@/common/shared/api/endpoints';
import { getToken } from '@/common/shared/utils/auth';

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
  },

  downloadBackup: () => {
    const token = getToken() || '';
    return `${API_BASE_URL}${ENDPOINTS.CONFIG.BACKUP}?token=${encodeURIComponent(token)}`;
  },
};
