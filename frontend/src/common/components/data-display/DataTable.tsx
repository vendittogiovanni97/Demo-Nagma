'use client';

import React, { ReactNode, useMemo, useState, useEffect, useRef } from 'react';
import { alpha } from '@mui/material/styles';
import { Box, CircularProgress, Stack, SxProps, Theme, useTheme, TablePagination, Typography } from '@mui/material';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ICellRendererParams, RowStyle } from 'ag-grid-community';
import useSWR from 'swr';
import * as XLSX from 'xlsx';

import { useBreakpointContext } from '@/common/context/BreakpointContext';
import StatePanel from '@/common/components/feedback/StatePanel';
import ConfirmDialog from '@/common/components/ui/ConfirmDialog';
import Button from '@/common/components/ui/Button';
import Icon from '@/common/components/ui/Icon';
import Badge from '@/common/components/ui/Badge';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

import { DataTableToolbar, ToolbarFilter, FilterChip } from './DataTableToolbar';
export type { ToolbarFilter, FilterChip };

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export interface Column<T> {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  minWidth?: string;
  render?: (item: T) => ReactNode;
  valueGetter?: (item: T) => any;
  sortable?: boolean;
  exportable?: boolean;
}

export type BaseColumnKey = 'id' | 'createdAt' | 'updatedAt' | 'status';

export interface FetchParams {
  page: number;
  limit: number;
  search?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filter?: Record<string, string>;
}

export interface DataTableProps<T> {
  title?: string;
  subtitle?: string;
  columns: Column<T>[];
  baseColumns?: BaseColumnKey[];
  data?: T[];
  fetchData?: (params: FetchParams) => Promise<{ data: T[]; total: number; totalPages?: number; page?: number; limit?: number } | any>;
  queryKey?: string | unknown[];
  refreshKey?: number;
  isLoading?: boolean;
  hasError?: boolean;
  keyExtractor: (item: T) => string | number;
  
  // Actions
  actions?: (item: T) => ReactNode;
  onRowClick?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void | Promise<void>;
  onView?: (item: T) => void;
  openEntityModal?: (action: 'Create' | 'Read' | 'Edit' | 'Delete', item?: T, onClose?: () => void, onSuccess?: () => void) => ReactNode;
  createLabel?: string;
  onCreateClick?: () => void;
  deleteConfirmMessage?: string;
  
  // Custom states
  emptyTitle?: string;
  emptyDescription?: string;
  emptyMessage?: string; // Backward compatibility
  errorTitle?: string;
  errorDescription?: string;
  
  // Layout and paging
  pageSize?: number;
  getRowStyle?: (item: T) => RowStyle | undefined;
  footer?: ReactNode;
  
  // Mobile rendering
  renderCard?: (item: T) => ReactNode;
  
  // Export configs
  exportable?: boolean;
  exportFileName?: string;
  
  // Toolbar configs
  hideState?: boolean;
  statusFilter?: string;
  statusFilterOptions?: FilterChip[];
  onStatusFilterChange?: (value: string | undefined) => void;
  toolbarFilters?: ToolbarFilter[];
  extraToolbarActions?: ReactNode;
  searchPlaceholder?: string;
}

const PAGINATION_HEIGHT = 48;

const CELL_WRAP_BASE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  overflow: 'visible',
};

function parsePxWidth(width?: string): number | undefined {
  if (!width) return undefined;
  const m = width.match(/^(\d+(?:\.\d+)?)px$/);
  return m ? parseFloat(m[1]) : undefined;
}

function getStatusBadgeVariant(status?: string): string {
  if (!status) return 'default';
  const s = status.toUpperCase();
  if (s === 'COMPLETATO' || s === 'CONFERMATO' || s === 'ATTIVO' || s === 'SUCCESS') return 'success';
  if (s === 'ANNULLATO' || s === 'CANCELLATO' || s === 'DISATTIVATO' || s === 'ERROR') return 'error';
  if (s === 'SPOSTATO' || s === 'MODIFICATO' || s === 'WARNING' || s === 'PENDING') return 'warning';
  if (s === 'CREATO' || s === 'INFO') return 'info';
  return 'default';
}

export default function DataTable<T extends object>({
  title,
  subtitle,
  columns,
  baseColumns = [],
  data = [],
  fetchData,
  queryKey,
  refreshKey = 0,
  isLoading = false,
  hasError = false,
  keyExtractor,
  
  actions,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  openEntityModal,
  createLabel,
  onCreateClick,
  deleteConfirmMessage,
  
  emptyTitle,
  emptyDescription = 'Prova a cambiare i filtri o la ricerca.',
  emptyMessage,
  errorTitle = 'Errore di caricamento',
  errorDescription = 'Si è verificato un problema durante il recupero dei dati.',
  
  pageSize = 10,
  getRowStyle,
  footer,
  
  renderCard,
  
  exportable = true,
  exportFileName,
  
  hideState = false,
  statusFilter,
  statusFilterOptions,
  onStatusFilterChange,
  toolbarFilters,
  extraToolbarActions,
  searchPlaceholder,
}: DataTableProps<T>) {
  const { isSmall, isMedium } = useBreakpointContext();
  const theme = useTheme();

  // Internal grid state for managed mode
  const isManaged = !!fetchData;
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(pageSize);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Status Filter State
  const [localStatusFilter, setLocalStatusFilter] = useState<string | undefined>(undefined);
  const activeStatusFilter = onStatusFilterChange ? statusFilter : localStatusFilter;
  const handleStatusFilterChange = onStatusFilterChange || setLocalStatusFilter;

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Modal actions state
  const [activeModalAction, setActiveModalAction] = useState<{ action: 'Create' | 'Read' | 'Edit' | 'Delete'; item?: T } | null>(null);

  // Column Visibility Menu State
  const colBtnRef = useRef<HTMLButtonElement | null>(null);
  const [colMenuAnchor, setColMenuAnchor] = useState<HTMLButtonElement | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});

  // Export Menu State
  const [exportAnchor, setExportAnchor] = useState<HTMLButtonElement | null>(null);
  const [exporting, setExporting] = useState(false);

  // Debounce search term
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 400);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchTerm]);

  const filterValuesStr = useMemo(() => {
    if (!toolbarFilters) return '';
    return toolbarFilters.map((f) => `${f.id}:${f.value}`).join(',');
  }, [toolbarFilters]);

  // SWR Fetching
  const swrKey = isManaged && queryKey
    ? [queryKey, page, limit, debouncedSearch, sortKey, sortOrder, activeStatusFilter, refreshKey, filterValuesStr]
    : null;

  const { data: swrResponse, error: swrError, isLoading: swrLoading, mutate: revalidate } = useSWR(
    swrKey,
    async () => {
      const filterParams: Record<string, string> = {};
      if (activeStatusFilter) filterParams.status = activeStatusFilter;
      if (toolbarFilters) {
        toolbarFilters.forEach((f) => {
          if (f.value !== undefined && f.value !== '') {
            filterParams[f.id] = f.value;
          }
        });
      }

      return fetchData!({
        page: page + 1,
        limit,
        search: debouncedSearch.trim() || undefined,
        orderBy: sortKey || undefined,
        orderDirection: sortOrder,
        filter: Object.keys(filterParams).length > 0 ? filterParams : undefined,
      });
    },
    { revalidateOnFocus: false, dedupingInterval: 1000 }
  );

  const finalEmptyTitle = emptyTitle || emptyMessage || 'Nessun dato trovato';
  const effectiveLoading = isManaged ? swrLoading : isLoading;
  const effectiveError = isManaged ? !!swrError : hasError;

  // Process rows & totals
  const rawRows: T[] = isManaged 
    ? (swrResponse?.data || swrResponse?.items || []) 
    : data;
  const totalCount = isManaged 
    ? (swrResponse?.total || swrResponse?.meta?.totalItems || 0) 
    : data.length;

  // Build columns with presets & visibility
  const visibleColumns = useMemo(() => {
    // 1. Build Base Columns Start
    const cols: Column<T>[] = [];
    
    if (baseColumns.includes('id')) {
      cols.push({
        key: 'id',
        label: 'ID',
        width: '80px',
        align: 'left',
        render: (item: any) => (
          <Typography sx={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'text.secondary' }}>
            #{item.id}
          </Typography>
        )
      });
    }

    // 2. Add custom columns
    columns.forEach((c) => {
      // Avoid duplicates of base columns
      if (c.key !== 'id' && c.key !== 'createdAt' && c.key !== 'updatedAt' && c.key !== 'status') {
        cols.push(c);
      }
    });

    // 3. Build Base Columns End
    if (baseColumns.includes('status')) {
      cols.push({
        key: 'status',
        label: 'Stato',
        width: '120px',
        align: 'center',
        render: (item: any) => (
          <Badge
            label={item.status}
            variant={getStatusBadgeVariant(item.status)}
            size="sm"
          />
        )
      });
    }

    if (baseColumns.includes('createdAt')) {
      cols.push({
        key: 'createdAt',
        label: 'Creato il',
        width: '160px',
        render: (item: any) => (
          <Typography sx={{ fontSize: '0.8125rem' }}>
            {item.createdAt ? format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm', { locale: it }) : '-'}
          </Typography>
        )
      });
    }

    if (baseColumns.includes('updatedAt')) {
      cols.push({
        key: 'updatedAt',
        label: 'Aggiornato il',
        width: '160px',
        render: (item: any) => (
          <Typography sx={{ fontSize: '0.8125rem' }}>
            {item.updatedAt ? format(new Date(item.updatedAt), 'dd/MM/yyyy HH:mm', { locale: it }) : '-'}
          </Typography>
        )
      });
    }

    // Filter columns by toggled visibility
    return cols.filter((c) => columnVisibility[c.key] !== false);
  }, [columns, baseColumns, columnVisibility]);

  // ag-Grid colDefs mapping
  const colDefs = useMemo<ColDef<T>[]>(() => {
    const cols: ColDef<T>[] = visibleColumns.map((col) => {
      const pxWidth = parsePxWidth(col.width);
      const alignStyle: React.CSSProperties = {
        ...CELL_WRAP_BASE,
        justifyContent: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start'
      };

      const def: ColDef<T> = {
        headerName: col.label,
        sortable: col.sortable !== false,
        resizable: true,
        suppressMovable: true,
        field: col.key as any,
        ...(pxWidth ? { width: pxWidth } : { flex: 1 }),
        ...(col.minWidth ? { minWidth: parsePxWidth(col.minWidth) } : { minWidth: pxWidth ? undefined : 150 }),
      };

      if (col.valueGetter) {
        def.valueGetter = (params) => params.data ? col.valueGetter!(params.data) : '';
      }

      if (col.render) {
        def.cellRenderer = (params: ICellRendererParams<T>) =>
          params.data ? <div style={alignStyle}>{col.render!(params.data)}</div> : null;
      } else {
        def.cellStyle = col.align && col.align !== 'left' ? { textAlign: col.align } : undefined;
      }
      return def;
    });

    // Actions Cell Renderer if handlers or custom actions provided
    const hasActions = onDelete || onEdit || onView || openEntityModal || actions;
    if (hasActions) {
      cols.push({
        headerName: 'Azioni',
        sortable: false,
        resizable: false,
        suppressMovable: true,
        width: 140,
        cellRenderer: (params: ICellRendererParams<T>) => {
          const row = params.data as T;
          if (!row) return null;
          if (actions) return actions(row);
          return (
            <div style={{ ...CELL_WRAP_BASE, justifyContent: 'center', gap: '4px' }}>
              {(onView || openEntityModal) && (
                <Button
                  variant="icon"
                  size="sm"
                  onClick={() => openEntityModal ? setActiveModalAction({ action: 'Read', item: row }) : onView!(row)}
                  icon={<Icon name="eye" size={15} />}
                  title="Vedi dettagli"
                />
              )}
              {(onEdit || openEntityModal) && (
                <Button
                  variant="icon"
                  size="sm"
                  onClick={() => openEntityModal ? setActiveModalAction({ action: 'Edit', item: row }) : onEdit!(row)}
                  icon={<Icon name="pencil" size={15} />}
                  title="Modifica"
                />
              )}
              {onDelete && (
                <Button
                  variant="icon"
                  size="sm"
                  onClick={() => setDeleteTarget(row)}
                  icon={<Icon name="trash2" size={15} />}
                  title="Elimina"
                  sx={{
                    color: alpha(theme.palette.error.main, 0.6),
                    '&:hover': {
                      color: theme.palette.error.main,
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                    }
                  }}
                />
              )}
            </div>
          );
        }
      });
    }

    return cols;
  }, [visibleColumns, onDelete, onEdit, onView, openEntityModal, actions, theme]);

  // Init visible columns list for the visibility popover
  useEffect(() => {
    const list: Record<string, boolean> = {};
    columns.forEach((c) => {
      list[c.key] = true;
    });
    setColumnVisibility((prev) => ({ ...list, ...prev }));
  }, [columns]);

  const toggleableCols = useMemo(() => {
    return columns.map((c) => ({
      colId: c.key,
      label: c.label,
      visible: columnVisibility[c.key] !== false,
    }));
  }, [columns, columnVisibility]);

  const handleColVisToggle = (colId: string, visible: boolean) => {
    setColumnVisibility((prev) => ({ ...prev, [colId]: visible }));
  };

  // Actions confirmation
  const handleConfirmDelete = async () => {
    if (!deleteTarget || !onDelete) return;
    setDeleting(true);
    try {
      await onDelete(deleteTarget);
      setDeleteTarget(null);
      if (isManaged) revalidate();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  // Export functions
  const handleRunExport = async (scope: 'current' | 'all', format: 'csv' | 'xlsx') => {
    setExporting(true);
    setExportAnchor(null);
    try {
      let rowsToExport: T[] = [];
      if (scope === 'all' && fetchData) {
        // Fetch all pages
        const fullRes = await fetchData({
          page: 1,
          limit: 10000,
          search: debouncedSearch.trim() || undefined,
          orderBy: sortKey || undefined,
          orderDirection: sortOrder,
        });
        rowsToExport = fullRes?.data || fullRes?.items || [];
      } else {
        rowsToExport = rawRows;
      }

      const formatted = rowsToExport.map((row) => {
        const obj: Record<string, any> = {};
        visibleColumns.forEach((c) => {
          if (c.key !== 'actions' && c.key !== '__actions') {
            obj[c.label] = c.valueGetter ? c.valueGetter(row) : (row as any)[c.key];
          }
        });
        return obj;
      });

      const worksheet = XLSX.utils.json_to_sheet(formatted);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Dati');
      
      const fileName = exportFileName || title || 'esportazione';
      if (format === 'csv') {
        XLSX.writeFile(workbook, `${fileName}.csv`, { bookType: 'csv' });
      } else {
        XLSX.writeFile(workbook, `${fileName}.xlsx`, { bookType: 'xlsx' });
      }
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  // Grid sorting changed handler
  const handleSortChanged = (event: any) => {
    const columnsState = event.api.getColumnState();
    const sortedCol = columnsState.find((c: any) => c.sort !== null && c.sort !== undefined);
    if (sortedCol) {
      setSortKey(sortedCol.colId);
      setSortOrder(sortedCol.sort as 'asc' | 'desc');
    } else {
      setSortKey(null);
      setSortOrder('asc');
    }
    setPage(0);
  };

  // Render components
  if (effectiveError) {
    return (
      <Box sx={{ py: 8 }}>
        <StatePanel
          variant="error"
          title={errorTitle}
          description={errorDescription}
        />
      </Box>
    );
  }

  if (effectiveLoading && rawRows.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <CircularProgress size={48} sx={{ color: theme.palette.primary.main, opacity: 0.8 }} />
          <Box sx={{ color: theme.palette.text.secondary, fontSize: '0.875rem', fontWeight: 500 }}>
            Caricamento in corso...
          </Box>
        </Stack>
      </Box>
    );
  }

  if (!effectiveLoading && rawRows.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Render toolbar even when table is empty so filters/search still work */}
        <DataTableToolbar
          onRefresh={isManaged ? () => revalidate() : undefined}
          hideState={hideState}
          activeStatusFilterOptions={statusFilterOptions}
          activeStatusFilter={activeStatusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          onPageReset={() => setPage(0)}
          toolbarFilters={toolbarFilters}
          extraToolbarActions={extraToolbarActions}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder={searchPlaceholder}
          colBtnRef={colBtnRef}
          onOpenColMenu={(e) => setColMenuAnchor(e.currentTarget)}
          colMenuAnchor={colMenuAnchor}
          onColMenuClose={() => setColMenuAnchor(null)}
          toggleableCols={toggleableCols}
          onColVisToggle={handleColVisToggle}
          showExport={exportable}
          exporting={exporting}
          exportAnchor={exportAnchor}
          onExportClick={(e) => setExportAnchor(e.currentTarget)}
          onExportClose={() => setExportAnchor(null)}
          onRunExport={handleRunExport}
          isManaged={isManaged}
        />
        <Box sx={{ py: 8 }}>
          <StatePanel
            variant="empty"
            title={finalEmptyTitle}
            description={emptyDescription}
          />
        </Box>
      </Box>
    );
  }

  // Mobile viewport renderer
  if (isSmall && renderCard) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <DataTableToolbar
          onRefresh={isManaged ? () => revalidate() : undefined}
          hideState={hideState}
          activeStatusFilterOptions={statusFilterOptions}
          activeStatusFilter={activeStatusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          onPageReset={() => setPage(0)}
          toolbarFilters={toolbarFilters}
          extraToolbarActions={extraToolbarActions}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder={searchPlaceholder}
          colBtnRef={colBtnRef}
          onOpenColMenu={(e) => setColMenuAnchor(e.currentTarget)}
          colMenuAnchor={colMenuAnchor}
          onColMenuClose={() => setColMenuAnchor(null)}
          toggleableCols={toggleableCols}
          onColVisToggle={handleColVisToggle}
          showExport={exportable}
          exporting={exporting}
          exportAnchor={exportAnchor}
          onExportClick={(e) => setExportAnchor(e.currentTarget)}
          onExportClose={() => setExportAnchor(null)}
          onRunExport={handleRunExport}
          isManaged={isManaged}
        />
        <Stack spacing={2} sx={{ pb: 4 }}>
          {rawRows.map((item) => (
            <Box key={keyExtractor(item)} onClick={() => onRowClick?.(item)}>
              {renderCard(item)}
            </Box>
          ))}
          {effectiveLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </Stack>
        {isManaged && totalCount > limit && (
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={limit}
            onRowsPerPageChange={(e) => {
              setLimit(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Righe per pagina"
            sx={{ borderTop: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.common.white, 0.01) }}
          />
        )}
      </Box>
    );
  }

  // Desktop view grid size calculation
  const ROW_HEIGHT = isSmall ? 48 : isMedium ? 56 : 64;
  const HEADER_HEIGHT = isSmall ? 40 : 44;
  const responsivePageSize = isSmall ? 4 : isMedium ? 6 : limit;
  const gridHeight = HEADER_HEIGHT + ROW_HEIGHT * responsivePageSize + (isManaged ? PAGINATION_HEIGHT : 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Title Header if provided */}
      {(title || onCreateClick || openEntityModal) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            {title && (
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'common.white', letterSpacing: '-0.01em' }}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {(onCreateClick || openEntityModal) && (
            <Button
              variant="primary"
              onClick={() => openEntityModal ? setActiveModalAction({ action: 'Create' }) : onCreateClick!()}
              icon={<Icon name="plus" size={16} />}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              {createLabel || 'Nuovo'}
            </Button>
          )}
        </Box>
      )}

      {/* Grid Toolbar */}
      <DataTableToolbar
        onRefresh={isManaged ? () => revalidate() : undefined}
        hideState={hideState}
        activeStatusFilterOptions={statusFilterOptions}
        activeStatusFilter={activeStatusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        onPageReset={() => setPage(0)}
        toolbarFilters={toolbarFilters}
        extraToolbarActions={extraToolbarActions}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={searchPlaceholder}
        colBtnRef={colBtnRef}
        onOpenColMenu={(e) => setColMenuAnchor(e.currentTarget)}
        colMenuAnchor={colMenuAnchor}
        onColMenuClose={() => setColMenuAnchor(null)}
        toggleableCols={toggleableCols}
        onColVisToggle={handleColVisToggle}
        showExport={exportable}
        exporting={exporting}
        exportAnchor={exportAnchor}
        onExportClick={(e) => setExportAnchor(e.currentTarget)}
        onExportClose={() => setExportAnchor(null)}
        onRunExport={handleRunExport}
        isManaged={isManaged}
      />

      {/* Grid Wrapper */}
      <Box sx={(t) => styles.container(t)}>
        <Box 
          className="ag-theme-alpine-dark nagma-grid" 
          sx={{ width: '100%', height: `${gridHeight}px` }}
        >
          <AgGridReact<T>
            rowData={rawRows}
            columnDefs={colDefs}
            getRowId={(p) => String(keyExtractor(p.data!))}
            getRowStyle={(p) => getRowStyle && p.data ? getRowStyle(p.data) : undefined}
            loading={effectiveLoading}
            onRowClicked={(p) => onRowClick && p.data && onRowClick(p.data)}
            onSortChanged={handleSortChanged}
            overlayNoRowsTemplate={`<span class="nagma-grid-empty">${finalEmptyTitle}</span>`}
            rowHeight={ROW_HEIGHT}
            headerHeight={HEADER_HEIGHT}
            pagination={isManaged ? false : true}
            paginationPageSize={responsivePageSize}
            paginationPageSizeSelector={false}
            rowSelection={{ mode: 'multiRow', enableClickSelection: false }}
            suppressMovableColumns
            suppressCellFocus
            enableCellTextSelection
            animateRows
            defaultColDef={{ sortable: true, resizable: true, filter: false }}
          />
        </Box>

        {footer && (
          <Box sx={styles.footer}>
            {footer}
          </Box>
        )}
      </Box>

      {/* SWR Custom Pagination */}
      {isManaged && totalCount > limit && (
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) => {
            setLimit(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Righe per pagina"
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderTop: 0,
            borderRadius: '0 0 12px 12px',
            bgcolor: alpha(theme.palette.common.white, 0.01),
            color: 'text.secondary'
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Conferma Eliminazione"
        message={
          deleteTarget
            ? `Sei sicuro di voler eliminare questo elemento definitivamente?`
            : ''
        }
        confirmText="Elimina"
        isDangerous
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Entity action modal injection */}
      {openEntityModal && activeModalAction && (
        openEntityModal(
          activeModalAction.action,
          activeModalAction.item,
          () => setActiveModalAction(null),
          () => {
            setActiveModalAction(null);
            if (isManaged) revalidate();
          }
        )
      )}
    </Box>
  );
}

const styles = {
  container: (theme: Theme) => ({
    bgcolor: alpha(theme.palette.common.white, 0.05),
    borderRadius: 3,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid',
    borderColor: 'divider'
  }),
  footer: {
    borderTop: '1px solid',
    borderColor: 'divider'
  } as SxProps<Theme>,
};
