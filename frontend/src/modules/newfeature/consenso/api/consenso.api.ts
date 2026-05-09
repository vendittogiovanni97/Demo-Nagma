import { httpClient } from '@/shared/api/httpClient';
import { ENDPOINTS } from '@/shared/api/endpoints';

export interface PublicBookingData {
  bookingId: number;
  customerName: string;
  phone: string;
  artistName: string;
  date: string;
}

export interface MedicalAnswers {
  maggiorenne: boolean;
  gravidanza: boolean;
  allergie: boolean;
  allergieDettagli?: string;
  anticoagulanti: boolean;
  cardiopatie: boolean;
  epilessia: boolean;
  malattieInfettive: boolean;
  diabete: boolean;
  accettaPermanenza: boolean;
  accettaPrivacy: boolean;
}

export interface ConsentSubmission {
  documentId: string;
  medicalAnswers: MedicalAnswers;
  signatureB64: string; // base64 PNG
}

export const consensusApi = {
  getConfig: async () => {
    return httpClient.get<{ success: boolean; showConsensi: boolean }>(ENDPOINTS.NEW_FEATURE.CONFIG);
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
