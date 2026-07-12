import { apiClient } from '@/common/shared/api/client';
import { API_BASE_URL, ENDPOINTS } from '@/common/shared/api/endpoints';
import { PublicBookingData, ConsentSubmission } from '../model/consenso.model';
import type { ConsentRecord } from '../model/consent-list.types';

export const consensoService = {
  getBookingPublic: async (id: number) => {
    return apiClient.get<{ success: boolean; data: PublicBookingData }>((ENDPOINTS.NEW_FEATURE.BOOKING_PUBLIC(id)) as any);
  },

  submitConsent: async (id: number, data: ConsentSubmission) => {
    return apiClient.post<{
      success: boolean;
      message: string;
      data: {
        attachmentId: string;
        hasMedicalAlerts: boolean;
        medicalAlertsDetails: string;
      };
    }>(ENDPOINTS.NEW_FEATURE.SUBMIT_CONSENT(id), data);
  },

  getConsents: async () => {
    return apiClient.get<{ success: boolean; data: ConsentRecord[] }>(
      ENDPOINTS.NEW_FEATURE.GET_CONSENTS
    );
  },

  getPdfUrl: (filePath: string) => {
    return `${API_BASE_URL}${filePath}`;
  },
};
