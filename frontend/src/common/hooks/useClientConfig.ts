import useSWR from 'swr';
import { apiClient } from '@/common/shared/api/client';
import { useAuth } from '@/common/context/AuthContext';

export interface ClientConfig {
  id: string;
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

const DEFAULT_CLIENT_CONFIG: ClientConfig = {
  id: 'default',
  clientName: 'Demo Nagma',
  clientTimeZone: 'Europe/Rome',
  clientLocale: 'it-IT',
  primaryColor: '#1976d2',
  secondaryColor: '#dc004e',
  features: {
    enableCream: true,
    enableWhatsApp: true,
    enableFormTemplate: true,
    enableConfig: true,
  },
  maxUsers: 100,
  maxBookings: 1000,
  maxAttachmentSizeMB: 50,
  bookingUpdatePassword: null,
  apiRateLimitPerMinute: 60,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Hook che fetcha la configurazione del cliente
 * Cachea il risultato per evitare richieste multiple
 */
export const useClientConfig = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: ClientConfig }>(
    isAuthenticated ? '/api/client-config' : null,
    async (url) => {
      try {
        const response = await apiClient.get<{ success: boolean; data: ClientConfig }>(url);
        return response;
      } catch (err) {
        console.warn('ClientConfig not found, using defaults:', err);
        return { success: true, data: DEFAULT_CLIENT_CONFIG };
      }
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minuto
      focusThrottleInterval: 300000, // 5 minuti
    }
  );

  const clientConfig = data?.data || DEFAULT_CLIENT_CONFIG;

  return {
    clientConfig,
    isLoading: authLoading || isLoading,
    error,
    mutate,
  };
};

/**
 * Hook per aggiornare la configurazione del cliente (admin only)
 */
export const useUpdateClientConfig = () => {
  const { mutate } = useClientConfig();

  const updateConfig = async (updates: Partial<ClientConfig>) => {
    try {
      await apiClient.put('/api/client-config', updates);
      await mutate();
    } catch (error) {
      console.error('Error updating client config:', error);
      throw error;
    }
  };

  return { updateConfig };
};
