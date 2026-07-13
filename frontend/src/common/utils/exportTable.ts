import * as XLSX from 'xlsx';
import type { ColumnDefinition } from '@/common/components/table/DataTable';

export interface ExportColumn<E> {
  header: string;
  value: (row: E) => string;
}

export function resolveExportColumns<E>(
  columns: ColumnDefinition<E>[],
  translate: (key: string) => string
): ExportColumn<E>[] {
  return columns
    .filter((c) => !String(c.key).startsWith('__') && c.exportable !== false)
    .map((c) => ({
      header: translate(c.label),
      value: (row: E) => {
        const val = c.exportValue 
          ? c.exportValue(row) 
          : (row as Record<string, unknown>)[c.key as string];
        if (val == null) return '';
        if (val instanceof Date) return val.toLocaleString('it-IT');
        return String(val);
      },
    }));
}

export function buildMatrix<E>(
  columns: ExportColumn<E>[],
  rows: E[]
): { headers: string[]; data: string[][] } {
  return {
    headers: columns.map((c) => c.header),
    data: rows.map((row) => columns.map((c) => c.value(row))),
  };
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function exportCsv(filename: string, headers: string[], data: string[][]): void {
  const formatted = data.map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, index) => {
      obj[h] = row[index];
    });
    return obj;
  });
  const worksheet = XLSX.utils.json_to_sheet(formatted);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dati');
  XLSX.writeFile(workbook, `${filename}.csv`, { bookType: 'csv' });
}

export async function exportXlsx(
  filename: string,
  headers: string[],
  data: string[][],
  sheetName = 'Dati'
): Promise<void> {
  const formatted = data.map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, index) => {
      obj[h] = row[index];
    });
    return obj;
  });
  const worksheet = XLSX.utils.json_to_sheet(formatted);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.substring(0, 31));
  XLSX.writeFile(workbook, `${filename}.xlsx`, { bookType: 'xlsx' });
}

export function slugifyFileName(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'export'
  );
}
