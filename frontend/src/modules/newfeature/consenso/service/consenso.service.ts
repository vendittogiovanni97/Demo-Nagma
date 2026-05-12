import { httpClient } from '@/shared/api/httpClient';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { PublicBookingData, ConsentSubmission } from '../model/consenso.model';

export const consensoService = {
  getConfig: async () => {
    return httpClient.get<{ success: boolean; SHOW_CONSENSI: boolean; SHOW_POSIZIONAMENTO: boolean }>(ENDPOINTS.NEW_FEATURE.CONFIG);
  },

  getBookingPublic: async (id: number) => {
    return httpClient.get<{ success: boolean; data: PublicBookingData }>((ENDPOINTS.NEW_FEATURE.BOOKING_PUBLIC(id)) as any);
  },

  submitConsent: async (id: number, data: ConsentSubmission) => {
    return httpClient.post<{
      success: boolean;
      message: string;
      data: {
        attachmentId: string;
        hasMedicalAlerts: boolean;
        medicalAlertsDetails: string;
      };
    }>(ENDPOINTS.NEW_FEATURE.SUBMIT_CONSENT(id), data);
  }
};
