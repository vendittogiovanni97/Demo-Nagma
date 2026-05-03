export interface CreateWhatsAppTemplateDTO {
  name: string;
  category?: string;
  body: string;
  isActive?: boolean;
}

export interface UpdateWhatsAppTemplateDTO {
  name?: string;
  category?: string;
  body?: string;
  isActive?: boolean;
}

export interface SendWhatsAppMessageDTO {
  recipientPhone: string;
  recipientName?: string;
  templateId?: number;
  message?: string;
  variables: Record<string, string>;
  bookingId?: number;
  customerId?: number;
}
