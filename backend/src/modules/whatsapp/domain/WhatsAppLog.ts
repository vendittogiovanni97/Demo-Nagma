export type WhatsAppMessageStatus = 'MANUAL_SENT' | 'FAILED' | 'SENT' | 'PENDING';

export interface WhatsAppLogProps {
  id?: number;
  templateId?: number | null;
  bookingId?: number | null;
  customerId?: number | null;
  createdById: number;
  recipientName?: string | null;
  recipientPhone: string;
  templateName?: string | null;
  message: string;
  status: WhatsAppMessageStatus;
  variablesJson?: any;
  createdAt?: Date;
  
  // Relations (optional for domain)
  template?: any;
  customer?: any;
  booking?: any;
  createdBy?: any;
}

export class WhatsAppLog {
  constructor(private props: WhatsAppLogProps) {}

  get id() { return this.props.id; }
  get templateId() { return this.props.templateId; }
  get bookingId() { return this.props.bookingId; }
  get customerId() { return this.props.customerId; }
  get createdById() { return this.props.createdById; }
  get recipientName() { return this.props.recipientName; }
  get recipientPhone() { return this.props.recipientPhone; }
  get templateName() { return this.props.templateName; }
  get message() { return this.props.message; }
  get status() { return this.props.status; }
  get variablesJson() { return this.props.variablesJson; }
  get createdAt() { return this.props.createdAt; }

  toJSON() {
    return { ...this.props };
  }
}
