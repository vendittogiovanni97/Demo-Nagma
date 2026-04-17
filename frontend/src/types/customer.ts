import type { Booking } from './booking';

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: string;
  _count?: {
    bookings: number;
  };
  bookings?: Booking[];
  whatsappLogs?: WhatsAppLog[];
}

export interface WhatsAppLog {
  id: number;
  templateName?: string;
  recipientName?: string;
  recipientPhone: string;
  message: string;
  status: 'MANUAL_SENT' | 'FAILED';
  createdAt: string;
  template?: { id: number; name: string };
}

export interface CustomerSummary {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  notes?: string;
  createdAt: string;
  totalSpent: number;
  upcomingBookings: number;
  lastBooking?: {
    date: string;
    type: string;
    status: string;
    artist: { name: string };
  };
  _count: {
    bookings: number;
  };
}

export interface CreateCustomerData {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  notes?: string;
}
