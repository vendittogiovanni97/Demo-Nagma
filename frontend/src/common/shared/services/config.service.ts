import { apiClient } from '@/common/shared/api/client';
import { API_BASE_URL, ENDPOINTS } from '@/common/shared/api/endpoints';

export interface ClientConfig {
  id: number;
  clientName: string;
  clientLogoUrl?: string;
  clientTimeZone: string;
  clientLocale: string;
  primaryColor: string;
  secondaryColor: string;
  features: {
    enableCream: boolean;
    enableWhatsApp: boolean;
    enableFormTemplate: boolean;
    enableConfig: boolean;
  };
  maxUsers: number;
  maxBookings: number;
  maxAttachmentSizeMB: number;
  apiRateLimitPerMinute: number;
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SystemConfig {
  success: boolean;
  SHOW_CONSENSI: boolean;
  SHOW_POSIZIONAMENTO: boolean;
  DEFAULT_PHONE_PREFIX: string;
}

export const configService = {
  getConfig: async (): Promise<SystemConfig> => {
    return apiClient.get<SystemConfig>(ENDPOINTS.CONFIG.BASE);
  },

  updateConfig: async (data: { SHOW_CONSENSI?: boolean; SHOW_POSIZIONAMENTO?: boolean; DEFAULT_PHONE_PREFIX?: string }) => {
    return apiClient.post<{ success: boolean; message: string }>(ENDPOINTS.CONFIG.BASE, data);
  },

  downloadBackup: () => {
    return `${API_BASE_URL}${ENDPOINTS.CONFIG.BACKUP}`;
  },

  // New ClientConfig endpoints
  getClientConfig: async (): Promise<ClientConfig> => {
    const response = await apiClient.get<{ success: boolean; data: ClientConfig }>(ENDPOINTS.CONFIG.CLIENT_CONFIG);
    return response.data;
  },

  updateClientConfig: async (payload: Partial<ClientConfig>): Promise<ClientConfig> => {
    const response = await apiClient.put<{ success: boolean; data: ClientConfig }>(ENDPOINTS.CONFIG.CLIENT_CONFIG, payload);
    return response.data;
  },
};
