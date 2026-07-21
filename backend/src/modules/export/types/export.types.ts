export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

export interface ExportColumnDto {
  key: string;
  label: string;
  type?: 'string' | 'number' | 'date' | 'boolean' | 'currency';
  width?: number;
}

export interface ExportRequestDto {
  format: ExportFormat;
  title?: string;
  filename?: string;
  entityType?: 'customer' | 'booking' | 'transaction' | 'staff' | 'cream';
  columns: ExportColumnDto[];
  filters?: Record<string, any>;
  data?: Record<string, any>[];
  includeFilterSummary?: boolean;
}
