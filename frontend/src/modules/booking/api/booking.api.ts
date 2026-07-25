import { ENDPOINTS, API_BASE_URL } from '@/common/shared/api/endpoints';
import { apiClient } from '@/common/shared/api/client';
import { getToken } from '@/common/shared/utils/auth';
import type { BookingDTO, BookingStatsDTO, CreateBookingRequest, UpdateBookingRequest } from './booking.types';

export const bookingApi = {
  getAll: async (params: {
    month?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    search?: string;
    sortOrder?: 'asc' | 'desc';
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

  delete: async (id: number, refund: boolean = true) => {
    const url = refund
      ? ENDPOINTS.BOOKINGS.BY_ID(id)
      : `${ENDPOINTS.BOOKINGS.BY_ID(id)}?refund=false`;
    return apiClient.delete<void>(url);
  },

  getStats: async (month?: string): Promise<BookingStatsDTO> => {
    return apiClient.get<BookingStatsDTO>(ENDPOINTS.BOOKINGS.STATS, { month });
  },

  getHistory: async (id: number) => {
    return apiClient.get(ENDPOINTS.BOOKINGS.HISTORY(id));
  },

  verifyPassword: async (password: string) => {
    return apiClient.post<void>(`${ENDPOINTS.BOOKINGS.BASE}/verify-password`, { password });
  },

  downloadAttachment: async (id: string | number, mimeType: string) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.ATTACHMENTS.DOWNLOAD(id)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Download fallito');
    const blob = await response.blob();
    return new Blob([blob], { type: mimeType });
  },
};
