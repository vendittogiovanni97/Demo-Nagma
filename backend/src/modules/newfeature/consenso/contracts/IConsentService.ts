import { MedicalAnswers } from '../domain/Consent';

export interface IConsentService {
  processConsent(
    bookingId: number,
    customerName: string,
    phone: string,
    documentId: string,
    medicalAnswers: MedicalAnswers,
    signatureB64: string
  ): Promise<{
    attachmentId: string;
    hasMedicalAlerts: boolean;
    medicalAlertsDetails: string;
  }>;
}
