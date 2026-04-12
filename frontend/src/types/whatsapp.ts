export interface WhatsAppTemplate {
  id: string;
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
  id: string;
  templateId?: string | null;
  customerId?: string | null;
  bookingId?: string | null;
  recipientName?: string | null;
  recipientPhone: string;
  templateName?: string | null;
  message: string;
  status: WhatsAppMessageStatus;
  createdAt: string;
  variablesJson?: Record<string, string> | null;
  template?: WhatsAppTemplate | null;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  } | null;
  createdBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface SendWhatsAppMessageData {
  templateId?: string;
  customerId?: string;
  bookingId?: string;
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
