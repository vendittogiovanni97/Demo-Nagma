import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import { Booking, BookingStats } from '@/types/dashboard';

export const bookingService = {
  getAll: (month?: string): Promise<Booking[]> =>
    apiClient.get(ENDPOINTS.BOOKINGS.BASE, { month }),

  getStats: (month?: string): Promise<BookingStats> =>
    apiClient.get(ENDPOINTS.BOOKINGS.STATS, { month }),

  create: (data: Partial<Booking>) =>
    apiClient.post(ENDPOINTS.BOOKINGS.BASE, data),

  update: (id: string, data: Partial<Booking>) =>
    apiClient.put(ENDPOINTS.BOOKINGS.BY_ID(id), data),

  delete: (id: string) =>
    apiClient.delete(ENDPOINTS.BOOKINGS.BY_ID(id)),
};
