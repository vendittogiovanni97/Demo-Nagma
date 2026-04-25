"use client";

import { useState, useMemo } from 'react';
import { Download, FileSpreadsheet, FileText, FileDown, AlertCircle, SlidersHorizontal, X } from 'lucide-react';
import { Alert, Box, MenuItem, Stack, TextField, Typography, useTheme } from '@mui/material';
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
  const theme = useTheme();
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

          {error ? (
            <Alert severity="error" icon={<AlertCircle size={18} />}>
              {error}
            </Alert>
          ) : null}

          {filters && filters.length > 0 && (
            <Stack useFlexGap sx={{ gap: 1.5 }}>
              <Stack direction="row" useFlexGap sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Stack direction="row" useFlexGap sx={{ gap: 1, alignItems: 'center' }}>
                  <SlidersHorizontal size={14} color={theme.palette.primary.main} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Filtri
                  </Typography>
                </Stack>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    icon={<X size={12} />}
                  >
                    Reset
                  </Button>
                )}
              </Stack>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}>
                {filters.map((filter) => {
                  const val = filterValues[filter.key] ?? '';
                  const onChange = (v: string) => setFilterValues(prev => ({ ...prev, [filter.key]: v }));

                  return (
                    <Box key={filter.key} sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: theme.palette.primary.main, textTransform: 'uppercase', letterSpacing: '0.08em', px: 0.5 }}>
                        {filter.label}
                      </Typography>

                      {filter.type === 'select' && filter.options ? (
                        <TextField
                          select
                          value={val}
                          onChange={(e) => onChange(e.target.value)}
                          size="small"
                          fullWidth
                          sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1.5 } }}
                        >
                          {filter.options.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      ) : filter.type === 'month' ? (
                        <TextField
                          type="month"
                          value={val}
                          onChange={(e) => onChange(e.target.value)}
                          size="small"
                          fullWidth
                          sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1.5 } }}
                        />
                      ) : filter.type === 'date' ? (
                        <TextField
                          type="date"
                          value={val}
                          onChange={(e) => onChange(e.target.value)}
                          size="small"
                          fullWidth
                          sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1.5 } }}
                        />
                      ) : (
                        <TextField
                          value={val}
                          onChange={(e) => onChange(e.target.value)}
                          placeholder={filter.placeholder ?? filter.label}
                          size="small"
                          fullWidth
                          sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1.5 } }}
                        />
                      )}
                    </Box>
                  );
                })}
              </Box>

              <Stack direction="row" useFlexGap sx={{ gap: 0.75, alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: filteredRows.length === 0 ? theme.palette.error.main : theme.palette.primary.main }}>
                  {filteredRows.length}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
                  {filteredRows.length === rows.length
                    ? `record da esportare`
                    : `di ${rows.length} record corrispondono ai filtri`}
                </Typography>
              </Stack>
            </Stack>
          )}

          <Stack useFlexGap sx={{ gap: 1.5 }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Formato
            </Typography>
            <Stack useFlexGap sx={{ gap: 1 }}>
              {formats.map((f) => {
                const Icon = f.icon;
                const isSelected = format === f.value;
                return (
                  <Button
                    key={f.value}
                    variant={isSelected ? 'primary' : 'glass'}
                    onClick={() => setFormat(f.value)}
                    sx={{ justifyContent: 'flex-start' }}
                    icon={<Icon size={22} />}
                  >
                    <Stack sx={{ textAlign: 'left' }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{f.label}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', opacity: 0.7 }}>{f.desc}</Typography>
                    </Stack>
                  </Button>
                );
              })}
            </Stack>
          </Stack>

          {(!filters || filters.length === 0) && (
            <Typography sx={{ fontSize: '0.8125rem', color: theme.palette.text.secondary }}>
              {rows.length} record da esportare
              {resolveRows && <Box component="span" sx={{ color: theme.palette.primary.main }}> (tutti i dati verranno scaricati)</Box>}
            </Typography>
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
        </Box>
      </Modal>
    </>
  );
}
