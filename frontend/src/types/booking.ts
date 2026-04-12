export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED' | 'COMPLETED';

export interface Booking {
  id: string;
  customerId: string;
  artistId: string;
  date: string;
  duration: number;
  status: BookingStatus;
  type: string;
  price?: number;
  deposit?: number;
  notes?: string;
  formData?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  artist?: {
    id: string;
    name: string;
    color?: string;
  };
}

export interface CreateBookingData {
  customerId: string;
  artistId: string;
  date: string;
  duration: number;
  type: string;
  price?: number;
  deposit?: number;
  notes?: string;
}

export interface BookingHistory {
  id: string;
  bookingId: string;
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
