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

export type WhatsAppMessageStatus = 'MANUAL_SENT' | 'AUTO_SENT' | 'FAILED';

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

export interface BirthdayCustomer {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  birthDate: string;
  alreadySentToday: boolean;
  lastMessageSentAt?: string | null;
}

export interface TodayBirthdaysResponse {
  success: boolean;
  data: BirthdayCustomer[];
  total: number;
  templateConfigured: boolean;
}

export interface BirthdayGreetingResult {
  customer: { id: number; name: string; phone: string };
  sentVia: 'whatsapp' | 'link';
  whatsappUrl?: string;
  message: string;
}

export interface BulkBirthdayGreetingResult {
  processedCount: number;
  sentCount: number;
  failedCount: number;
  results: Array<{ customerId: number; name: string; success: boolean }>;
}

export type WhatsAppConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';

export interface WhatsAppSessionInfo {
  status: WhatsAppConnectionStatus;
  qrCodeDataUrl: string | null;
  phoneNumber: string | null;
  userName: string | null;
}

