import { API_BASE_URL, ENDPOINTS } from '@/common/shared/api/endpoints';
import { getToken } from '@/common/shared/utils/auth';

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

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
  entityType?: 'customer' | 'booking' | 'transaction' | 'staff' | 'cream';
  columns: ExportColumnOption[];
  filters?: Record<string, any>;
  data?: Record<string, any>[];
  includeFilterSummary?: boolean;
}

export const exportApi = {
  download: async (options: ExportOptions): Promise<void> => {
    const token = getToken();
    const url = `${API_BASE_URL}${ENDPOINTS.EXPORT.BASE}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error('Errore durante la generazione dell\'export');
    }

    const blob = await response.blob();
    const filename = options.filename
      ? `${options.filename}.${options.format}`
      : `export_${Date.now()}.${options.format}`;

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
