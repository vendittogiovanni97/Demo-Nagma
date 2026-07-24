import { API_BASE_URL, ENDPOINTS } from '@/common/shared/api/endpoints';
import { apiClient } from '@/common/shared/api/client';
import { getToken } from '@/common/shared/utils/auth';
import type { Booking } from '@/modules/booking/model/booking.types';

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';
export type ExportEntityType = 'customer' | 'booking' | 'transaction' | 'staff' | 'cream';
export type ExportValue = string | number | boolean | null | undefined;

export interface ExportColumnOption {
  key: string;
  label: string;
  type?: 'string' | 'number' | 'date' | 'boolean' | 'currency';
  width?: number;
}

export interface ExportOptions {
  format: ExportFormat;
  title?: string;
  filename?: string;
  entityType?: ExportEntityType;
  columns: ExportColumnOption[];
  filters?: Record<string, unknown>;
  data?: Record<string, ExportValue>[];
  includeFilterSummary?: boolean;
  pdfSummary?: {
    label: string;
    value: string;
  };
}

export interface BookingExportFilters {
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
  filters: BookingExportFilters;
  filtersLabel: string;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

async function download(options: ExportOptions): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.EXPORT.BASE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken() ?? ''}`,
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    throw new Error('Errore durante la generazione dell\'export');
  }

  const filename = `${options.filename ?? `export_${Date.now()}`}.${options.format}`;
  triggerDownload(await response.blob(), filename);
}

async function getBookingsForExport(filters: BookingExportFilters): Promise<ExportResponse<Booking>> {
  const params = Object.fromEntries(
    Object.entries(filters).filter((entry): entry is [string, string] => Boolean(entry[1])),
  );
  return apiClient.get<ExportResponse<Booking>>('/api/bookings/export', params);
}

export const exportService = {
  download,
  getBookingsForExport,
};
