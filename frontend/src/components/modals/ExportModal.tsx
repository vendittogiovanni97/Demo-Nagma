"use client";

import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, FileDown } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from './Modal';
import type { ExportColumn } from '@/utils/export';
import { exportRowsToCsv, exportRowsToPdf, exportRowsToXlsx } from '@/utils/export';

type ExportFormat = 'xlsx' | 'csv' | 'pdf';

export interface ExportFilter {
  key: string;
  label: string;
  type: 'select' | 'month' | 'week' | 'text';
  value: string;
  options?: { label: string; value: string }[];
  onChange: (value: string) => void;
}

interface ExportModalProps<T> {
  filenameBase: string;
  title: string;
  rows: T[];
  columns: ExportColumn<T>[];
  filters?: ExportFilter[];
  filtersLabel?: string;
  resolveRows?: () => Promise<T[]>;
}

export default function ExportModal<T>({
  filenameBase,
  title,
  rows,
  columns,
  filters,
  filtersLabel,
  resolveRows,
}: ExportModalProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('xlsx');
  const [isExporting, setIsExporting] = useState(false);

  const formats: { value: ExportFormat; label: string; icon: typeof FileSpreadsheet; desc: string }[] = [
    { value: 'xlsx', label: 'Excel (.xlsx)', icon: FileSpreadsheet, desc: 'Foglio di calcolo con formattazione' },
    { value: 'csv', label: 'CSV (.csv)', icon: Download, desc: 'Testo separato da virgole, universale' },
    { value: 'pdf', label: 'PDF (.pdf)', icon: FileText, desc: 'Documento pronto per la stampa' },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = resolveRows ? await resolveRows() : rows;
      switch (format) {
        case 'xlsx':
          exportRowsToXlsx(filenameBase, data, columns);
          break;
        case 'csv':
          exportRowsToCsv(filenameBase, data, columns);
          break;
        case 'pdf':
          exportRowsToPdf(filenameBase, title, data, columns, filtersLabel);
          break;
      }
      setIsOpen(false);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Button
        variant="glass"
        size="md"
        disabled={rows.length === 0}
        onClick={() => setIsOpen(true)}
        icon={<FileDown size={18} />}
      >
        Esporta
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Esporta Dati">
        <div className="flex flex-col gap-6">
          {/* Filters */}
          {filters && filters.length > 0 && (
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-bold text-text-secondary uppercase tracking-widest">Filtri</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filters.map((filter) => (
                  <div key={filter.key} className="flex flex-col gap-1">
                    <label className="text-xs text-text-secondary">{filter.label}</label>
                    {filter.type === 'select' && filter.options ? (
                      <select
                        value={filter.value}
                        onChange={(e) => filter.onChange(e.target.value)}
                        className="rounded-xl border border-surface-border bg-white/5 px-4 py-3 text-white outline-none transition focus:border-accent"
                      >
                        {filter.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : filter.type === 'month' ? (
                      <input
                        type="month"
                        value={filter.value}
                        onChange={(e) => filter.onChange(e.target.value)}
                        className="rounded-xl border border-surface-border bg-white/5 px-4 py-3 text-white outline-none transition focus:border-accent"
                      />
                    ) : filter.type === 'week' ? (
                      <input
                        type="date"
                        value={filter.value}
                        onChange={(e) => filter.onChange(e.target.value)}
                        className="rounded-xl border border-surface-border bg-white/5 px-4 py-3 text-white outline-none transition focus:border-accent"
                      />
                    ) : (
                      <input
                        type="text"
                        value={filter.value}
                        onChange={(e) => filter.onChange(e.target.value)}
                        placeholder={filter.label}
                        className="rounded-xl border border-surface-border bg-white/5 px-4 py-3 text-white outline-none transition focus:border-accent"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Format selection */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold text-text-secondary uppercase tracking-widest">Formato</h4>
            <div className="flex flex-col gap-2">
              {formats.map((f) => {
                const Icon = f.icon;
                const isSelected = format === f.value;
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFormat(f.value)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-accent bg-accent/10 text-white'
                        : 'border-surface-border bg-white/2 text-text-secondary hover:border-white/20'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <Icon size={22} className={isSelected ? 'text-accent' : ''} />
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-sm">{f.label}</span>
                      <span className="text-xs text-text-secondary">{f.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row count info */}
          <div className="text-sm text-text-secondary">
            {rows.length} {rows.length === 1 ? 'record' : 'record'} da esportare
            {resolveRows && <span className="text-accent"> (tutti i dati verranno scaricati)</span>}
          </div>

          {/* Export button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => void handleExport()}
            disabled={isExporting || rows.length === 0}
            isLoading={isExporting}
            loadingLabel="Esportazione in corso..."
            icon={isExporting ? undefined : <Download size={20} />}
          >
            {!isExporting && `Esporta ${formats.find(f => f.value === format)?.label}`}
          </Button>
        </div>
      </Modal>
    </>
  );
}
