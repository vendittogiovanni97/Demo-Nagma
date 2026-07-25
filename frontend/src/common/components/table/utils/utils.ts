import type { Theme } from '@mui/material/styles';
import { exportService, type ExportFormat } from '@/common/shared/api/export.api';
import type {
  ColumnDefinition,
} from '../TableColumns';
import type { DetailRow, TableActionTone } from '../DataTable.types';

// ─── DATA & TYPE HELPERS ──────────────────────────────────────────────────────

export function isDetailRow<E>(row: E | DetailRow<E>): row is DetailRow<E> {
  return typeof row === 'object' && row !== null && '__isDetailRow' in row;
}

export function getRowStatus<E>(row: E): string {
  if (typeof row === 'object' && row !== null && 'status' in row && typeof row.status === 'string') {
    return row.status;
  }
  return '';
}

export function resolveActionColor(theme: Theme, tone: TableActionTone): string {
  switch (tone) {
    case 'primary':
      return theme.palette.primary.main;
    case 'success':
      return theme.palette.success.main;
    case 'warning':
      return theme.palette.warning.main;
    case 'error':
      return theme.palette.error.main;
    case 'whatsapp':
      return theme.palette.custom.whatsapp;
    default:
      return theme.palette.text.secondary;
  }
}

// ─── EXPORT TABLE HELPERS ─────────────────────────────────────────────────────

export interface ExportColumn<E> {
  header: string;
  value: (row: E) => string;
}

export function resolveExportColumns<E>(
  columns: ColumnDefinition<E>[],
  translate: (key: string) => string,
): ExportColumn<E>[] {
  return columns
    .filter((column) => !String(column.key).startsWith('__') && column.exportable !== false)
    .map((column) => ({
      header: translate(column.label),
      value: (row: E) => {
        const value = column.exportValue
          ? column.exportValue(row)
          : (row as Record<string, unknown>)[column.key as string];
        if (value == null) return '';
        if (value instanceof Date) return value.toLocaleString('it-IT');
        return String(value);
      },
    }));
}

export function buildMatrix<E>(
  columns: ExportColumn<E>[],
  rows: E[],
): { headers: string[]; data: string[][] } {
  return {
    headers: columns.map((column) => column.header),
    data: rows.map((row) => columns.map((column) => column.value(row))),
  };
}

async function exportMatrix(
  format: ExportFormat,
  filename: string,
  headers: string[],
  data: string[][],
): Promise<void> {
  const columns = headers.map((label, index) => ({ key: `col_${index}`, label }));
  const rows = data.map((row) =>
    Object.fromEntries(row.map((value, index) => [`col_${index}`, value])),
  );

  await exportService.download({
    format,
    title: filename.replace(/-/g, ' ').toUpperCase(),
    filename,
    columns,
    data: rows,
  });
}

export const exportCsv = (filename: string, headers: string[], data: string[][]) =>
  exportMatrix('csv', filename, headers, data);

export const exportXlsx = (filename: string, headers: string[], data: string[][]) =>
  exportMatrix('xlsx', filename, headers, data);

export const exportPdf = (filename: string, headers: string[], data: string[][]) =>
  exportMatrix('pdf', filename, headers, data);

export function slugifyFileName(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'export';
}
