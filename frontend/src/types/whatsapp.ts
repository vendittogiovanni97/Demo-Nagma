export interface WhatsAppTemplate {
  id: number;
  name: string;
  category?: string | null;
  body: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWhatsAppTemplateData {
  name: string;
  category?: string;
  body: string;
  isActive?: boolean;
}

export interface RecommendedWhatsAppTemplate extends CreateWhatsAppTemplateData {
  description: string;
}

export type WhatsAppMessageStatus = 'MANUAL_SENT' | 'FAILED';

export interface WhatsAppMessageLog {
  id: number;
  templateId?: number | null;
  customerId?: number | null;
  bookingId?: number | null;
  recipientName?: string | null;
  recipientPhone: string;
  templateName?: string | null;
  message: string;
  status: WhatsAppMessageStatus;
  createdAt: string;
  variablesJson?: Record<string, string> | null;
  template?: WhatsAppTemplate | null;
  customer?: {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
  } | null;
  createdBy?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface SendWhatsAppMessageData {
  templateId?: number;
  customerId?: number;
  bookingId?: number;
  recipientName?: string;
  recipientPhone: string;
  message?: string;
  variables: Record<string, string>;
}

export interface SendWhatsAppMessageResponse {
  whatsappUrl: string;
  message: string;
  log: WhatsAppMessageLog;
}
