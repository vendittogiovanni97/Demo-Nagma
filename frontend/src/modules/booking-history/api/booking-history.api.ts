import { apiClient } from '@/common/shared/api/client';
import { ENDPOINTS } from '@/common/shared/api/endpoints';
import type { BookingStatus } from '@/common/shared/types/enums';

export type BookingAction = BookingStatus;

export interface BookingHistoryEntry {
  id: number;
  bookingId: number;
  action: BookingAction;
  oldDate: string | null;
  newDate: string | null;
  changedBy: {
    id: number;
    name: string;
    email: string;
  } | null;
  changedById: number | null;
  changedAt: string;
  booking: {
    id: number;
    customer: {
      id: number;
      firstName: string;
      lastName: string;
      phone: string;
    };
    artist: {
      id: number;
      name: string;
      color: string;
    } | null;
    date: string;
    status: string;
    price: number | null;
  } | null;
}

export interface BookingHistoryFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  action?: BookingAction;
  userId?: number;
  artistId?: number;
  search?: string;
}

export interface BookingHistoryResponse {
  data: BookingHistoryEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const bookingHistoryService = {
  getAll: async (filters: BookingHistoryFilters = {}): Promise<BookingHistoryResponse> => {
    return apiClient.get<BookingHistoryResponse>(ENDPOINTS.ADMIN.BOOKING_HISTORY, filters as any);
  },
};