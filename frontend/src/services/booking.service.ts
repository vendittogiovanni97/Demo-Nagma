import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Booking, BookingStats, BookingHistory, CreateBookingData } from '@/types/booking';

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
  update: async (id: number, data: Partial<CreateBookingData> & { status?: string; price?: number }) => {
    return apiClient.put(ENDPOINTS.BOOKINGS.BY_ID(id), data);
  },
  getHistory: async (id: number): Promise<BookingHistory[]> => {
    return apiClient.get<BookingHistory[]>(ENDPOINTS.BOOKINGS.HISTORY(id));
  },
  delete: async (id: number) => {
    return apiClient.delete(ENDPOINTS.BOOKINGS.BY_ID(id));
  },
  getAvailableArtists: async (date: string): Promise<any[]> => {
    return apiClient.get<any[]>(`${ENDPOINTS.BOOKINGS.BASE}/available-artists`, { date });
  },
};
