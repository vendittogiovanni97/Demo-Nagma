import { BookingStatus } from '../domain/Booking';

export interface CreateBookingDTO {
  customerId: number;
  artistId: number;
  date: string;
  duration?: number;
  price?: number;
  deposit?: number;
  notes?: string;
  formData?: any;
}

export interface UpdateBookingDTO {
  date?: string;
  artistId?: number;
  duration?: number;
  status?: BookingStatus;
  price?: number;
  deposit?: number;
  notes?: string;
  formData?: any;
}

export interface BookingResponseDTO {
  id: number;
  customerId: number;
  artistId: number;
  date: Date;
  duration: number;
  status: BookingStatus;
  price?: number;
  deposit?: number;
  notes?: string;
  formData?: any;
}
