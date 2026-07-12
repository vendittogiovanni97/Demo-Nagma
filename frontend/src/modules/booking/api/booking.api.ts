import { ENDPOINTS } from '@/common/shared/api/endpoints';
import { apiClient } from '@/common/shared/api/client';
import type { BookingDTO, BookingStatsDTO, CreateBookingRequest, UpdateBookingRequest } from './booking.types';

export const bookingApi = {
  getAll: async (params: {
    month?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    return apiClient.get<{ data: BookingDTO[]; total: number; hasMore: boolean }>(
      ENDPOINTS.BOOKINGS.BASE,
      params
    );
  },

  getById: async (id: number) => {
    return apiClient.get<BookingDTO>(ENDPOINTS.BOOKINGS.BY_ID(id));
  },

  create: async (data: CreateBookingRequest) => {
    return apiClient.post<BookingDTO>(ENDPOINTS.BOOKINGS.BASE, data);
  },

  update: async (id: number, data: UpdateBookingRequest) => {
    return apiClient.put<BookingDTO>(ENDPOINTS.BOOKINGS.BY_ID(id), data);
  },

  delete: async (id: number) => {
    return apiClient.delete<void>(ENDPOINTS.BOOKINGS.BY_ID(id));
  },

  getStats: async (month?: string): Promise<BookingStatsDTO> => {
    return apiClient.get<BookingStatsDTO>(ENDPOINTS.BOOKINGS.STATS, { month });
  },

  getHistory: async (id: number) => {
    return apiClient.get(ENDPOINTS.BOOKINGS.HISTORY(id));
  },

  verifyPassword: async (password: string) => {
    return apiClient.post<void>(`${ENDPOINTS.BOOKINGS.BASE}/verify-password`, { password });
  }
};
