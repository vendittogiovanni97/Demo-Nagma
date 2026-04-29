import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Booking, BookingStats, BookingHistory, CreateBookingData, AvailableArtist } from '@/types/booking';

export const bookingService = {
  getAll: async (month?: string, startDate?: string, endDate?: string, page?: number, limit?: number): Promise<Booking[]> => {
    // API returns { data, total, hasMore }, extract data array
    const response = await apiClient.get<{ data: Booking[]; total: number; hasMore: boolean }>(
      ENDPOINTS.BOOKINGS.BASE,
      { month, startDate, endDate, page, limit }
    );
    return response.data;
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
  getAvailableArtists: async (date: string): Promise<AvailableArtist[]> => {
    return apiClient.get<AvailableArtist[]>(`${ENDPOINTS.BOOKINGS.BASE}/available-artists`, { date });
  },
  verifyPassword: async (password: string): Promise<void> => {
    return apiClient.post(`${ENDPOINTS.BOOKINGS.BASE}/verify-password`, { password });
  },
};
