import * as XLSX from 'xlsx';

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

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
          h1 { margin-bottom: 8px; }
          p { color: #555; margin-top: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; }
          th { background: #f3f4f6; text-transform: uppercase; letter-spacing: 0.04em; }
          tr:nth-child(even) { background: #fafafa; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>${filters || 'Esportazione dati filtrati'}</p>
        <table>
          <thead><tr>${head}</tr></thead>
          <tbody>${body}</tbody>
        </table>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.onafterprint = () => printWindow.close();
  void filenameBase;
}

export type { ExportColumn };
