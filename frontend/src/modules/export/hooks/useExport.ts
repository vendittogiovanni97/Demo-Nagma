import { useToast } from '@/common/hooks/useToast';
import { useState } from 'react';
import { exportApi, ExportColumnOption, ExportFormat } from '../api/exportApi';

interface UseExportProps {
  defaultTitle?: string;
  defaultFilename?: string;
  entityType?: 'customer' | 'booking' | 'transaction' | 'staff' | 'cream';
  columns: ExportColumnOption[];
  data?: Record<string, any>[];
  filters?: Record<string, any>;
}

export function useExport({
  defaultTitle = 'Export Dati',
  defaultFilename = 'export_dati',
  entityType,
  columns: initialColumns,
  data,
  filters,
}: UseExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>(
    initialColumns.map((c) => c.key)
  );
  const toast = useToast();

  const handleQuickExport = async (format: ExportFormat) => {
    try {
      setIsExporting(true);
      const activeCols = initialColumns.filter((c) => selectedColumnKeys.includes(c.key));
      await exportApi.download({
        format,
        title: defaultTitle,
        filename: `${defaultFilename}_${Date.now()}`,
        entityType,
        columns: activeCols.length > 0 ? activeCols : initialColumns,
        data,
        filters,
      });
      toast.success(`Export ${format.toUpperCase()} completato con successo!`);
    } catch (err: any) {
      toast.error(err.message || 'Errore durante l\'esportazione.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCustomExport = async (options: {
    format: ExportFormat;
    filename: string;
    selectedKeys: string[];
  }) => {
    try {
      setIsExporting(true);
      const activeCols = initialColumns.filter((c) => options.selectedKeys.includes(c.key));
      await exportApi.download({
        format: options.format,
        title: defaultTitle,
        filename: options.filename,
        entityType,
        columns: activeCols,
        data,
        filters,
      });
      toast.success(`Export ${options.format.toUpperCase()} completato!`);
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Errore durante l\'esportazione personalizzata.');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    isModalOpen,
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
    selectedColumnKeys,
    setSelectedColumnKeys,
    handleQuickExport,
    handleCustomExport,
    columns: initialColumns,
  };
}
