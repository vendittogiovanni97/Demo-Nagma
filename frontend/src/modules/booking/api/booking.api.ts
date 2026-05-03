import { ENDPOINTS } from '@/shared/api/endpoints';
import { httpClient } from '@/shared/api/httpClient';
import type { BookingDTO, BookingStatsDTO, CreateBookingRequest, UpdateBookingRequest } from './booking.types';

export const bookingApi = {
  getAll: async (params: {
    month?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    return httpClient.get<{ data: BookingDTO[]; total: number; hasMore: boolean }>(
      ENDPOINTS.BOOKINGS.BASE,
      params
    );
  },

  getById: async (id: number) => {
    return httpClient.get<BookingDTO>(ENDPOINTS.BOOKINGS.BY_ID(id));
  },

  create: async (data: CreateBookingRequest) => {
    return httpClient.post<BookingDTO>(ENDPOINTS.BOOKINGS.BASE, data);
  },

  update: async (id: number, data: UpdateBookingRequest) => {
    return httpClient.put<BookingDTO>(ENDPOINTS.BOOKINGS.BY_ID(id), data);
  },

  delete: async (id: number) => {
    return httpClient.delete<void>(ENDPOINTS.BOOKINGS.BY_ID(id));
  },

  getStats: async (month?: string): Promise<BookingStatsDTO> => {
    return httpClient.get<BookingStatsDTO>(ENDPOINTS.BOOKINGS.STATS, { month });
  },

  getHistory: async (id: number) => {
    return httpClient.get(ENDPOINTS.BOOKINGS.HISTORY(id));
  },

  verifyPassword: async (password: string) => {
    return httpClient.post<void>(`${ENDPOINTS.BOOKINGS.BASE}/verify-password`, { password });
  }
};
