"use client";

import { alpha } from '@mui/material/styles';
import SmartModal from '@/common/components/common/SmartModal';
import Button from '@/common/components/ui/Button';
import { Alert, Box, Stack, Typography, useTheme } from '@mui/material';
import Icon from '@/common/components/ui/Icon';
import { useEffect, useMemo, useState } from 'react';

import {
  exportService,
  type ExportFormat,
  type ExportValue,
} from '@/common/shared/api/export.api';
import FormInput from '@/common/components/forms/FormInput';
import FormSelect from '@/common/components/forms/FormSelect';

const KNOWN_FILTER_KEYS = ['cliente', 'artista', 'stato', 'giorno', 'mese'];

export interface ExportColumn<T> {
  label: string;
  /** Larghezza nel PDF in punti: se assente il generatore sceglie in base all'etichetta. */
  width?: number;
  value: (row: T) => string | number | undefined | null;
  strikeThroughInPdf?: (row: T) => boolean;
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

export interface ExportNaming {
  title?: string;
  filenameBase?: string;
}

interface ExportModalProps<T> {
  filenameBase: string;
  title: string;
  /** Titolo e nome file calcolati dai filtri scelti nel modale (es. il mese selezionato). */
  getExportNaming?: (filterValues: Record<string, string>) => ExportNaming;
  rows: T[];
  columns: ExportColumn<T>[];
  filters?: ExportFilter<T>[];
  filtersLabel?: string;
  resolveRows?: () => Promise<T[]>;
  useBackendFilters?: boolean;
  getFilterParams?: () => ExportFilters;
  getPdfSummary?: (rows: T[]) => { label: string; value: string };
  getPdfRowVariant?: (row: T) => 'success' | undefined;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ExportModal<T>({
  filenameBase: defaultFilenameBase,
  title: defaultTitle,
  getExportNaming,
  rows,
  columns,
  filters,
  filtersLabel,
  resolveRows,
  useBackendFilters = false,
  getFilterParams,
  getPdfSummary,
  getPdfRowVariant,
  isOpen: externalOpen,
  onClose: externalClose,
}: ExportModalProps<T>) {
  const theme = useTheme();
  const [internalOpen, setInternalOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;

  // Con resolveRows i dati vengono presi dal server all'apertura, così filtri e conteggio
  // lavorano sullo stesso insieme che verrà esportato.
  const [fetchedRows, setFetchedRows] = useState<T[] | null>(null);
  const [isLoadingRows, setIsLoadingRows] = useState(false);

  useEffect(() => {
    if (!isOpen || !resolveRows) {
      setFetchedRows(null);
      return;
    }
    let cancelled = false;
    setIsLoadingRows(true);
    setError(null);
    resolveRows()
      .then((data) => { if (!cancelled) setFetchedRows(data); })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Errore nel recupero dei dati');
      })
      .finally(() => { if (!cancelled) setIsLoadingRows(false); });
    return () => { cancelled = true; };
    // resolveRows cambia identità a ogni render dei chiamanti: si ricarica solo all'apertura.
  }, [isOpen]);

  const sourceRows = resolveRows ? (fetchedRows ?? []) : rows;


  const initialValues = useMemo(() => {
    const init: Record<string, string> = {};
    filters?.forEach(f => { init[f.key] = f.defaultValue ?? ''; });
    return init;
  }, [filters]);

  const [filterValues, setFilterValues] = useState<Record<string, string>>(initialValues);

  const filteredRows = useMemo(() => {
    if (!filters || filters.length === 0) return sourceRows;
    return sourceRows.filter(row =>
      filters.every(f => {
        const val = filterValues[f.key] ?? '';
        if (!val) return true;
        return f.filterFn(row, val);
      })
    );
  }, [sourceRows, filters, filterValues]);

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
      }

      const exportColumns = columns.map((column, index) => ({
        key: `col_${index}`,
        label: column.label,
        width: column.width,
      }));
      const exportRows = data.map((row) =>
        Object.fromEntries(
          [
            ...columns.flatMap((column, index) => [
              [`col_${index}`, column.value(row) as ExportValue],
              [`col_${index}__pdfStrikeThrough`, column.strikeThroughInPdf?.(row) ?? false],
            ]),
            ['__pdfRowVariant', getPdfRowVariant?.(row)],
          ],
        ),
      );

      const naming = getExportNaming?.(filterValues);
      const title = naming?.title ?? defaultTitle;
      const filenameBase = naming?.filenameBase ?? defaultFilenameBase;

      const finalTitle = finalFiltersLabel && !title.toLowerCase().includes(finalFiltersLabel.toLowerCase())
        ? `${title} — ${finalFiltersLabel}`
        : title;

      await exportService.download({
        format,
        filename: filenameBase,
        title: finalTitle,
        columns: exportColumns,
        data: exportRows,
        includeFilterSummary: Boolean(finalFiltersLabel),
        pdfSummary: getPdfSummary?.(data),
      });
      handleClose();
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Errore durante l\'esportazione');
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
          disabled={!resolveRows && rows.length === 0}
          onClick={handleOpen}
          icon={<Icon name="fileDown" size={18} />}
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
        saveLabel={`Esporta in ${format.toUpperCase()}`}
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
                { value: 'xlsx', label: 'Cartella Excel (.xlsx con stili)' },
              ]}
            />
          </Box>

          {error ? (
            <Alert severity="error" icon={<Icon name="alertCircle" size={18} />} sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          ) : null}

          {filters && filters.length > 0 && (
            <Stack useFlexGap sx={{ gap: 2 }}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', px: 0.5 }}>
                  <Icon name="slidersHorizontal" size={14} color={theme.palette.primary.main} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                    Opzioni Filtro
                  </Typography>
                </Stack>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    icon={<Icon name="x" size={12} />}
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

              {filters.some(f => !KNOWN_FILTER_KEYS.includes(f.key)) && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                  {filters.filter(f => !KNOWN_FILTER_KEYS.includes(f.key)).map(renderFilterItem)}
                </Box>
              )}

              <Stack direction="row" sx={{ gap: 1, alignItems: 'center', p: 2, borderRadius: 2, backgroundColor: alpha(theme.palette.primary.main, 0.05), border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: filteredRows.length === 0 ? theme.palette.error.main : theme.palette.primary.main }}>
                  {filteredRows.length}
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                  {filteredRows.length === sourceRows.length
                    ? `record da esportare`
                    : `di ${sourceRows.length} record corrispondono ai filtri attuali`}
                </Typography>
              </Stack>
            </Stack>
          )}

          {(!filters || filters.length === 0) && (
            <Box sx={{ p: 2, borderRadius: 2, backgroundColor: alpha(theme.palette.primary.main, 0.05), border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
              <Typography sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                Stai per esportare <Box component="span" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>{filteredRows.length}</Box> record.
                {resolveRows && <Box component="span" sx={{ display: 'block', mt: 0.5, fontSize: '0.75rem' }}>Verranno scaricati tutti i dati disponibili per questa vista.</Box>}
              </Typography>
            </Box>
          )}
        </Box>
      </SmartModal>
    </>
  );
}
