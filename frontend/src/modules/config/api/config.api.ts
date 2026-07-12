import { apiClient } from '@/common/shared/api/client';
import { ENDPOINTS } from '@/common/shared/api/endpoints';

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
  bookingUpdatePassword: string | null;
  apiRateLimitPerMinute: number;
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateClientConfigPayload {
  clientName?: string;
  clientLogoUrl?: string;
  clientTimeZone?: string;
  clientLocale?: string;
  primaryColor?: string;
  secondaryColor?: string;
  features?: ClientConfig['features'];
  maxUsers?: number;
  maxBookings?: number;
  maxAttachmentSizeMB?: number;
  bookingUpdatePassword?: string;
  apiRateLimitPerMinute?: number;
  customFields?: Record<string, any>;
}

export const configService = {
  getClientConfig: async (): Promise<ClientConfig> => {
    const response = await apiClient.get<{ success: boolean; data: ClientConfig }>(
      ENDPOINTS.CONFIG.CLIENT_CONFIG
    );
    return response.data;
  },

  updateClientConfig: async (payload: UpdateClientConfigPayload): Promise<ClientConfig> => {
    const response = await apiClient.put<{ success: boolean; data: ClientConfig }>(
      ENDPOINTS.CONFIG.CLIENT_CONFIG,
      payload
    );
    return response.data;
  },
};
