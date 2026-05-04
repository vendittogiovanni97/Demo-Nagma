"use client";

import SmartModal from '@/components/common/SmartModal';
import Button from '@/components/ui/Button';
import { Alert, Box, Stack, Typography, useTheme } from '@mui/material';
import { AlertCircle, FileDown, SlidersHorizontal, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { exportService } from '@/shared/api/export.api';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';

type ExportFormat = 'pdf' | 'csv';

export interface ExportColumn<T> {
  label: string;
  value: (row: T) => string | number | undefined | null;
}

export interface ExportFilters {
  [key: string]: string | undefined;
}

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
  isOpen?: boolean;
  onClose?: () => void;
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
  isOpen: externalOpen,
  onClose: externalClose,
}: ExportModalProps<T>) {
  const theme = useTheme();
  const [internalOpen, setInternalOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;


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

  const handleOpen = () => {
    setFilterValues(initialValues);
    setError(null);
    if (externalOpen === undefined) setInternalOpen(true);
  };

  const handleClose = () => {
    setError(null);
    setFilterValues(initialValues);
    if (externalClose) externalClose();
    else setInternalOpen(false);
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
          data = response.data as unknown as T[];
          finalFiltersLabel = response.filtersLabel;
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Errore nel recupero dei dati filtrati');
          return;
        }
      } else if (resolveRows) {
        data = await resolveRows();
      }

      switch (format) {
        case 'pdf':  
          import('@/shared/utils/export').then(mod => {
            mod.exportRowsToPdf(filenameBase, title, data, columns, finalFiltersLabel);
          });
          break;
        case 'csv':
          import('@/shared/utils/export').then(mod => {
            mod.exportRowsToCsv(filenameBase, data, columns);
          });
          break;
      }
      handleClose();
    } finally {
      setIsExporting(false);
    }
  };

  const renderFilterItem = (filter: ExportFilter<T>) => {
    const val = filterValues[filter.key] ?? '';
    const onChange = (v: string) => setFilterValues(prev => ({ ...prev, [filter.key]: v }));

    if (filter.type === 'select' && filter.options) {
      return (
        <FormSelect
          key={filter.key}
          label={filter.label}
          value={val}
          onChange={onChange}
          options={filter.options}
        />
      );
    }

    return (
      <FormInput
        key={filter.key}
        label={filter.label}
        type={filter.type === 'month' ? 'month' : filter.type === 'date' ? 'date' : 'text'}
        value={val}
        onChange={onChange}
        placeholder={filter.placeholder ?? filter.label}
      />
    );
  };

  return (
    <>
      {externalOpen === undefined && (
        <Button
          variant="glass"
          size="md"
          disabled={rows.length === 0}
          onClick={handleOpen}
          icon={<FileDown size={18} />}
        >
          Esporta
        </Button>
      )}

      <SmartModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Esporta Dati"
        onSave={handleExport}
        isSaving={isExporting}
        saveLabel={format === 'pdf' ? 'Esporta in PDF' : 'Scarica CSV'}
        saveDisabled={filteredRows.length === 0}
        maxWidth="md"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Format Selection */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.12em', px: 0.5 }}>
              Formato Esportazione
            </Typography>
            <FormSelect
              value={format}
              onChange={(v) => setFormat(v as ExportFormat)}
              options={[
                { value: 'pdf', label: 'Documento PDF (per stampa/lettura)' },
                { value: 'csv', label: 'File CSV (per Excel/Commercialista)' },
              ]}
            />
          </Box>

          {error ? (
            <Alert severity="error" icon={<AlertCircle size={18} />} sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          ) : null}

          {filters && filters.length > 0 && (
            <Stack useFlexGap sx={{ gap: 2 }}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', px: 0.5 }}>
                  <SlidersHorizontal size={14} color={theme.palette.primary.main} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                    Opzioni Filtro
                  </Typography>
                </Stack>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    icon={<X size={12} />}
                  >
                    Resetta
                  </Button>
                )}
              </Stack>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                {filters.filter(f => ['cliente', 'artista'].includes(f.key)).map(renderFilterItem)}
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
                {filters.filter(f => ['stato', 'giorno', 'mese'].includes(f.key)).map(renderFilterItem)}
              </Box>

              <Stack direction="row" sx={{ gap: 1, alignItems: 'center', p: 2, borderRadius: 2, backgroundColor: 'rgba(0, 191, 255, 0.05)', border: '1px solid rgba(0, 191, 255, 0.1)' }}>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: filteredRows.length === 0 ? theme.palette.error.main : theme.palette.primary.main }}>
                  {filteredRows.length}
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                  {filteredRows.length === rows.length
                    ? `record da esportare`
                    : `di ${rows.length} record corrispondono ai filtri attuali`}
                </Typography>
              </Stack>
            </Stack>
          )}

          {(!filters || filters.length === 0) && (
            <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(0, 191, 255, 0.05)', border: '1px solid rgba(0, 191, 255, 0.1)' }}>
              <Typography sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                Stai per esportare <Box component="span" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>{rows.length}</Box> record.
                {resolveRows && <Box component="span" sx={{ display: 'block', mt: 0.5, fontSize: '0.75rem' }}>Verranno scaricati tutti i dati disponibili per questa vista.</Box>}
              </Typography>
            </Box>
          )}
        </Box>
      </SmartModal>
    </>
  );
}
