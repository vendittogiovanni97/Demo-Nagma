"use client";

import { useState, useMemo } from 'react';
import { Download, FileSpreadsheet, FileText, FileDown, AlertCircle, SlidersHorizontal, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from './Modal';
import type { ExportColumn } from '@/utils/export';
import { exportRowsToCsv, exportRowsToPdf, exportRowsToXlsx } from '@/utils/export';
import type { ExportFilters } from '@/services/export.service';
import { exportService } from '@/services/export.service';

type ExportFormat = 'xlsx' | 'csv' | 'pdf';

export interface ExportFilter<T> {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'month';
  defaultValue?: string;
  placeholder?: string;
  options?: { label: string; value: string }[];
  filterFn: (row: T, value: string) => boolean;
}

interface ExportModalProps<T> {
  filenameBase: string;
  title: string;
  rows: T[];
  columns: ExportColumn<T>[];
  filters?: ExportFilter<T>[];
  filtersLabel?: string;
  resolveRows?: () => Promise<T[]>;
  useBackendFilters?: boolean;
  getFilterParams?: () => ExportFilters;
}

export default function ExportModal<T>({
  filenameBase,
  title,
  rows,
  columns,
  filters,
  filtersLabel,
  resolveRows,
  useBackendFilters = false,
  getFilterParams,
}: ExportModalProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('xlsx');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialValues = useMemo(() => {
    const init: Record<string, string> = {};
    filters?.forEach(f => { init[f.key] = f.defaultValue ?? ''; });
    return init;
  }, [filters]);

  const [filterValues, setFilterValues] = useState<Record<string, string>>(initialValues);

  const filteredRows = useMemo(() => {
    if (!filters || filters.length === 0) return rows;
    return rows.filter(row =>
      filters.every(f => {
        const val = filterValues[f.key] ?? '';
        if (!val) return true;
        return f.filterFn(row, val);
      })
    );
  }, [rows, filters, filterValues]);

  const hasActiveFilters = filters?.some(f => (filterValues[f.key] ?? '') !== '');

  const resetFilters = () => setFilterValues(initialValues);

  const formats: { value: ExportFormat; label: string; icon: typeof FileSpreadsheet; desc: string }[] = [
    { value: 'xlsx', label: 'Excel (.xlsx)', icon: FileSpreadsheet, desc: 'Foglio di calcolo con formattazione' },
    { value: 'csv', label: 'CSV (.csv)', icon: Download, desc: 'Testo separato da virgole, universale' },
    { value: 'pdf', label: 'PDF (.pdf)', icon: FileText, desc: 'Documento pronto per la stampa' },
  ];

  const handleOpen = () => {
    setFilterValues(initialValues);
    setError(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
    setFilterValues(initialValues);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    try {
      let data: T[] = filteredRows;
      let finalFiltersLabel = filtersLabel;

      if (useBackendFilters && getFilterParams) {
        try {
          const filterParams = getFilterParams();
          const response = await exportService.getBookingsForExport(filterParams);
          data = response.data;
          finalFiltersLabel = response.filtersLabel;
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Errore nel recupero dei dati filtrati');
          return;
        }
      } else if (resolveRows) {
        data = await resolveRows();
      }

      switch (format) {
        case 'xlsx': exportRowsToXlsx(filenameBase, data, columns); break;
        case 'csv':  exportRowsToCsv(filenameBase, data, columns);  break;
        case 'pdf':  exportRowsToPdf(filenameBase, title, data, columns, finalFiltersLabel); break;
      }
      handleClose();
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
        onClick={handleOpen}
        icon={<FileDown size={18} />}
      >
        Esporta
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose} title="Esporta Dati">
        <div className="flex flex-col gap-5">

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* ── Filtri ── */}
          {filters && filters.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={14} className="text-accent" />
                  <h4 className="text-sm font-bold text-text-secondary uppercase tracking-widest">Filtri</h4>
                </div>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="flex items-center gap-1 text-xs text-text-secondary hover:text-white transition-colors"
                  >
                    <X size={12} /> Reset
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filters.map((filter) => {
                  const val = filterValues[filter.key] ?? '';
                  const onChange = (v: string) => setFilterValues(prev => ({ ...prev, [filter.key]: v }));

                  return (
                    <div key={filter.key} className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-text-secondary">{filter.label}</label>

                      {filter.type === 'select' && filter.options ? (
                        <select
                          value={val}
                          onChange={e => onChange(e.target.value)}
                          className="rounded-xl border border-surface-border bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-accent appearance-none"
                        >
                          {filter.options.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-[#0a1822]">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : filter.type === 'month' ? (
                        <input
                          type="month"
                          value={val}
                          onChange={e => onChange(e.target.value)}
                          className="rounded-xl border border-surface-border bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-accent"
                        />
                      ) : filter.type === 'date' ? (
                        <input
                          type="date"
                          value={val}
                          onChange={e => onChange(e.target.value)}
                          className="rounded-xl border border-surface-border bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-accent"
                        />
                      ) : (
                        <input
                          type="text"
                          value={val}
                          onChange={e => onChange(e.target.value)}
                          placeholder={filter.placeholder ?? filter.label}
                          className="rounded-xl border border-surface-border bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-accent placeholder:text-white/25"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Conteggio record filtrati */}
              <div className="flex items-center gap-2 text-xs">
                <span className={`font-bold ${filteredRows.length === 0 ? 'text-danger' : 'text-accent'}`}>
                  {filteredRows.length}
                </span>
                <span className="text-text-secondary">
                  {filteredRows.length === rows.length
                    ? `record da esportare`
                    : `di ${rows.length} record corrispondono ai filtri`}
                </span>
              </div>
            </div>
          )}

          {/* ── Formato ── */}
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

          {/* Conteggio se no filtri */}
          {(!filters || filters.length === 0) && (
            <div className="text-sm text-text-secondary">
              {rows.length} record da esportare
              {resolveRows && <span className="text-accent"> (tutti i dati verranno scaricati)</span>}
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => void handleExport()}
            disabled={isExporting || filteredRows.length === 0}
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
