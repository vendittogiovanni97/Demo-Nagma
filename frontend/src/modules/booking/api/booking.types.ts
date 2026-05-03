export type BookingStatus = 'CREATO' | 'CONFERMATO' | 'COMPLETATO' | 'MODIFICATO' | 'SPOSTATO' | 'ANNULLATO' | 'CANCELLATO';

export interface BookingDTO {
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

export interface BookingStatsDTO {
  total: number;
  confirmed: number;
  cancelled: number;
  rescheduled: number;
  completed: number;
  month: string;
}

export interface CreateBookingRequest {
  customerId: number;
  artistId: number;
  date: string;
  duration?: number;
  price?: number;
  deposit?: number;
  notes?: string;
  formData?: Record<string, unknown>;
}

export interface UpdateBookingRequest extends Partial<CreateBookingRequest> {
  status?: BookingStatus;
}
