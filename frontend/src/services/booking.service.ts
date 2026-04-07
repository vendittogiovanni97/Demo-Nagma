import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Booking, BookingStats, CreateBookingData } from '@/types';

export const bookingService = {
  getAll: async (month?: string): Promise<Booking[]> => {
    return apiClient.get<Booking[]>(ENDPOINTS.BOOKINGS.BASE, { month });
  },
  getStats: async (month?: string): Promise<BookingStats> => {
    return apiClient.get<BookingStats>(ENDPOINTS.BOOKINGS.STATS, { month });
  },
  create: async (data: CreateBookingData) => {
    return apiClient.post(ENDPOINTS.BOOKINGS.BASE, data);
  },
  update: async (id: string, data: Partial<CreateBookingData> & { status?: string; price?: number }) => {
    return apiClient.put(ENDPOINTS.BOOKINGS.BY_ID(id), data);
  },
  delete: async (id: string) => {
    return apiClient.delete(ENDPOINTS.BOOKINGS.BY_ID(id));
  },
};
