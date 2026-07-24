export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

export interface ExportColumnDto {
  key: string;
  label: string;
  type?: 'string' | 'number' | 'date' | 'boolean' | 'currency';
  width?: number;
}

export type ExportValue = string | number | boolean | Date | null | undefined;
export type ExportRow = Record<string, unknown>;

export interface ExportRequestDto {
  format: ExportFormat;
  title?: string;
  filename?: string;
  entityType?: 'customer' | 'booking' | 'transaction' | 'staff' | 'cream';
  columns: ExportColumnDto[];
  filters?: Record<string, unknown>;
  data?: ExportRow[];
  includeFilterSummary?: boolean;
  pdfSummary?: {
    label: string;
    value: string;
  };
}
