import type { Booking } from './booking';
import type { CreamSale } from './cream';

export interface Customer {
  id: string;
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
  creamSales?: CreamSale[];
  whatsappLogs?: WhatsAppLog[];
}

export interface WhatsAppLog {
  id: string;
  templateName?: string;
  recipientName?: string;
  recipientPhone: string;
  message: string;
  status: 'MANUAL_SENT' | 'FAILED';
  createdAt: string;
  template?: { id: string; name: string };
}

export interface CustomerSummary {
  id: string;
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
    creamSales: number;
  };
}

export interface CreateCustomerData {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  notes?: string;
}
