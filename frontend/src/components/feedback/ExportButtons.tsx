"use client";

import { useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

import type { ExportColumn } from '@/utils/export';
import { exportRowsToCsv, exportRowsToPdf, exportRowsToXlsx } from '@/utils/export';

interface ExportButtonsProps<T> {
  filenameBase: string;
  title: string;
  rows: T[];
  columns: ExportColumn<T>[];
  filtersLabel?: string;
  resolveRows?: () => Promise<T[]>;
}

export default function ExportButtons<T>({
  filenameBase,
  title,
  rows,
  columns,
  filtersLabel,
  resolveRows,
}: ExportButtonsProps<T>) {
  const [isExporting, setIsExporting] = useState(false);
  const isDisabled = rows.length === 0;

  const withRows = async (callback: (data: T[]) => void) => {
    setIsExporting(true);
    try {
      const exportRows = resolveRows ? await resolveRows() : rows;
      callback(exportRows);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={isDisabled || isExporting}
        onClick={() => void withRows((data) => exportRowsToXlsx(filenameBase, data, columns))}
        className="glass-btn flex items-center gap-2 px-5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FileSpreadsheet size={18} />
        <span>XLSX</span>
      </button>
      <button
        type="button"
        disabled={isDisabled || isExporting}
        onClick={() => void withRows((data) => exportRowsToCsv(filenameBase, data, columns))}
        className="glass-btn flex items-center gap-2 px-5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download size={18} />
        <span>CSV</span>
      </button>
      <button
        type="button"
        disabled={isDisabled || isExporting}
        onClick={() => void withRows((data) => exportRowsToPdf(filenameBase, title, data, columns, filtersLabel))}
        className="glass-btn flex items-center gap-2 px-5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FileText size={18} />
        <span>PDF</span>
      </button>
    </>
  );
}
