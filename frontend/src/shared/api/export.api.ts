import { apiClient } from '@/shared/api/client';
import type { Booking } from '@/modules/booking/model/booking.types';

export interface ExportFilters {
  fromDate?: string;
  toDate?: string;
  weekday?: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  status?: 'CREATO' | 'CONFERMATO' | 'COMPLETATO' | 'MODIFICATO' | 'SPOSTATO' | 'ANNULLATO' | 'CANCELLATO';
  artistId?: string;
  customerId?: string;
}

export interface ExportResponse<T> {
  data: T[];
  count: number;
  filters: ExportFilters;
  filtersLabel: string;
}

export class ExportService {
  async getBookingsForExport(filters: ExportFilters): Promise<ExportResponse<Booking>> {
    const params = new URLSearchParams();

    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);
    if (filters.weekday) params.append('weekday', filters.weekday);
    if (filters.status) params.append('status', filters.status);
    if (filters.artistId) params.append('artistId', filters.artistId);
    if (filters.customerId) params.append('customerId', filters.customerId);

    const response = await apiClient.get<ExportResponse<Booking>>(`/api/bookings/export?${params.toString()}`);
    return response;
  }
}

export const exportService = new ExportService();
