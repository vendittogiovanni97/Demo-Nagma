import type { Booking } from '@/modules/booking/model/booking.types';
import type { WhatsAppLog } from '../model/customer.model';

export interface CustomerDTO {
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

export interface CustomerSummaryDTO {
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
    status: string;
    price?: number | null;
    artist: { name: string };
  } | null;
  _count: {
    bookings: number;
  };
}

export interface CreateCustomerRequest {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {}
