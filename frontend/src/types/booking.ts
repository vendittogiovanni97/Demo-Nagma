export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED' | 'COMPLETED';

export interface Booking {
  id: number;
  customerId: number;
  artistId: number;
  date: string;
  duration: number;
  status: BookingStatus;
  price?: number;
  deposit?: number;
  notes?: string;
  formData?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: number;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  artist?: {
    id: number;
    name: string;
    color?: string;
  };
}

export interface CreateBookingData {
  customerId: number;
  artistId: number;
  date: string;
  duration?: number;
  price?: number;
  deposit?: number;
  notes?: string;
  formData?: Record<string, unknown>;
}

export interface BookingHistory {
  id: number;
  bookingId: number;
  action: string;
  oldDate?: string;
  newDate?: string;
  changedBy: string;
  changedAt: string;
}

export interface BookingStats {
  total: number;
  confirmed: number;
  cancelled: number;
  rescheduled: number;
  completed: number;
  month: string;
}
