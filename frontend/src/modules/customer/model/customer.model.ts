import type { Booking } from '@/modules/booking/model/booking.types';

export interface CustomerModel {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  notes: string;
  createdAt: string;
  totalBookings: number;
  bookings?: Booking[];
  whatsappLogs?: WhatsAppLog[];
}

export interface CustomerSummaryModel {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
  createdAt: string;
  totalSpent: number;
  upcomingBookingsCount: number;
  lastBooking?: {
    date: string;
    status: string;
    price: number;
    artistName: string;
  } | null;
  totalBookings: number;
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
