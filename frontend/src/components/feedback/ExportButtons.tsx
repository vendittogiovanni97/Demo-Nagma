"use client";

import { useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import Button from '@/components/ui/Button';

import type { ExportColumn } from '@/shared/utils/export';
import { exportRowsToCsv, exportRowsToPdf, exportRowsToXlsx } from '@/shared/utils/export';

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
      <Button
        variant="glass"
        size="md"
        disabled={isDisabled || isExporting}
        onClick={() => void withRows((data) => exportRowsToXlsx(filenameBase, data, columns))}
        icon={<FileSpreadsheet size={18} />}
      >
        XLSX
      </Button>
      <Button
        variant="glass"
        size="md"
        disabled={isDisabled || isExporting}
        onClick={() => void withRows((data) => exportRowsToCsv(filenameBase, data, columns))}
        icon={<Download size={18} />}
      >
        CSV
      </Button>
      <Button
        variant="glass"
        size="md"
        disabled={isDisabled || isExporting}
        onClick={() => void withRows((data) => exportRowsToPdf(filenameBase, title, data, columns, filtersLabel))}
        icon={<FileText size={18} />}
      >
        PDF
      </Button>
    </>
  );
}
