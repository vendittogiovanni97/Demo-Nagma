import { BookingStatus } from '@/common/shared/types/enums';
export type { BookingStatus };

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
  attachments?: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    createdAt: string;
  }>;
}

export interface BookingStatsDTO {
  total: number;
  created: number;
  confirmed: number;
  modified: number;
  rescheduled: number;
  cancelled: number;
  annullated?: number;
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
