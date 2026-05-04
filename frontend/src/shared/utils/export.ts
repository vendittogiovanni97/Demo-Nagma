import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

type ExportColumn<T> = {
  label: string;
  value: (item: T) => string | number | boolean | null | undefined;
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeCsvValue(value: string | number | boolean | null | undefined) {
  const normalized = value == null ? '' : String(value);
  return `"${normalized.replaceAll('"', '""')}"`;
}

function buildHtmlTable<T>(rows: T[], columns: ExportColumn<T>[]) {
  const head = columns.map((column) => `<th>${column.label}</th>`).join('');
  const body = rows
    .map((row) => {
      const cells = columns
        .map((column) => `<td>${String(column.value(row) ?? '')}</td>`)
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  return { head, body };
}

function buildTimestamp() {
  return new Date().toISOString().slice(0, 10);
}

export function exportRowsToCsv<T>(filenameBase: string, rows: T[], columns: ExportColumn<T>[]) {
  const header = columns.map((column) => escapeCsvValue(column.label)).join(',');
  const body = rows
    .map((row) => columns.map((column) => escapeCsvValue(column.value(row))).join(','))
    .join('\n');

  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filenameBase}-${buildTimestamp()}.csv`);
}

export function exportRowsToXlsx<T>(filenameBase: string, rows: T[], columns: ExportColumn<T>[]) {
  const worksheetData = [
    columns.map((column) => column.label),
    ...rows.map((row) => columns.map((column) => column.value(row) ?? '')),
  ];
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dati');
  XLSX.writeFile(workbook, `${filenameBase}-${buildTimestamp()}.xlsx`);
}

export function exportRowsToPdf<T>(
  filenameBase: string,
  title: string,
  rows: T[],
  columns: ExportColumn<T>[],
  filters?: string
) {
  const printWindow = window.open('', '_blank', 'width=1200,height=800');
  if (!printWindow) return;

  const { head, body } = buildHtmlTable(rows, columns);
  const timestamp = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: it });

  import('./export-template').then(mod => {
    printWindow.document.write(mod.getPdfTemplate({ title, head, body, filters, timestamp }));
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for fonts to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    }, 500);
  });

  void filenameBase;
}

export type { ExportColumn };
