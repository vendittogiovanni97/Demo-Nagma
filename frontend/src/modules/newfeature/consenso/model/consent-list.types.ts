export interface ConsentRecord {
  bookingId: number;
  date: string;
  customerName: string;
  phone: string;
  artistName: string | null;
  signedAt: string | null;
  documentId: string | null;
  hasMedicalAlerts: boolean;
  medicalAlertsDetails: string;
  attachment: {
    id: string;
    fileName: string;
    filePath: string;
    createdAt: string;
  } | null;
}
