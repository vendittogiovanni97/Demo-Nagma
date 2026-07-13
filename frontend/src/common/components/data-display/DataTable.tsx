'use client';

import React, { ReactNode, useMemo } from 'react';
import { alpha } from '@mui/material/styles';
import { Box, CircularProgress, Stack, SxProps, Theme, useTheme } from '@mui/material';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ICellRendererParams, RowStyle } from 'ag-grid-community';
import { useBreakpointContext } from '@/common/context/BreakpointContext';
import StatePanel from '@/common/components/feedback/StatePanel';

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
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  hasError?: boolean;
  keyExtractor: (item: T) => string | number;
  /** Mobile card renderer */
  renderCard?: (item: T) => ReactNode;
  /** Actions for each row (desktop) */
  actions?: (item: T) => ReactNode;
  /** Row styling logic */
  getRowStyle?: (item: T) => RowStyle | undefined;
  /** Custom empty state titles */
  emptyTitle?: string;
  emptyDescription?: string;
  emptyMessage?: string; // Backward compatibility with old DataTable
  /** Custom error state */
  errorTitle?: string;
  errorDescription?: string;
  /** Pagination */
  pageSize?: number;
  onRowClick?: (item: T) => void;
  footer?: ReactNode;
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

export default function DataTable<T extends object>({
  columns,
  data,
  isLoading = false,
  hasError = false,
  keyExtractor,
  renderCard,
  actions,
  getRowStyle,
  emptyTitle,
  emptyDescription = 'Prova a cambiare i filtri o la ricerca.',
  emptyMessage,
  errorTitle = 'Errore di caricamento',
  errorDescription = 'Si è verificato un problema durante il recupero dei dati.',
  pageSize = 10,
  onRowClick,
  footer,
}: DataTableProps<T>) {
  const { isSmall, isMedium } = useBreakpointContext();
  const theme = useTheme();

  const finalEmptyTitle = emptyTitle || emptyMessage || 'Nessun dato trovato';

  // Build colDefs first (before early returns) to adhere to React rules-of-hooks
  const colDefs = useMemo<ColDef<T>[]>(() => {
    const safeColumns = columns.length > 0 ? columns : [{ key: '_empty', label: 'Nessun dato' }];
    
    const cols: ColDef<T>[] = safeColumns.map((col) => {
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
        ...(pxWidth ? { width: pxWidth } : { flex: 1 }),
        ...(col.minWidth ? { minWidth: parsePxWidth(col.minWidth) } : { minWidth: pxWidth ? undefined : 200 }),
      };

      // Set up valueGetter for sorting and filtering
      if (col.valueGetter) {
        def.valueGetter = (params) => params.data ? col.valueGetter!(params.data) : '';
      } else {
        def.valueGetter = (params) => {
          if (!params.data) return '';
          const key = col.key;
          const dataAny = params.data as any;
          
          if (key === 'cliente' || key === 'client') {
            const cust = dataAny.customer || dataAny.booking?.customer;
            return cust ? `${cust.firstName} ${cust.lastName}`.trim() : '';
          }
          if (key === 'artista' || key === 'artist') {
            return dataAny.artist?.name || dataAny.booking?.artist?.name || '';
          }
          if (key === 'telefono' || key === 'phone') {
            return dataAny.customer?.phone || dataAny.booking?.customer?.phone || '';
          }
          if (key === 'data_ora' || key === 'date' || key === 'data') {
            return dataAny.date || dataAny.booking?.date || '';
          }
          if (key === 'prenotato_il' || key === 'createdAt') {
            return dataAny.createdAt || dataAny.booking?.createdAt || '';
          }
          if (key === 'stato' || key === 'status') {
            return dataAny.status || dataAny.booking?.status || '';
          }
          if (key === 'durata' || key === 'duration') {
            return dataAny.duration || dataAny.booking?.duration || 0;
          }
          if (key === 'prezzo' || key === 'price') {
            return dataAny.price || dataAny.booking?.price || 0;
          }
          if (key === 'saldo' || key === 'balance') {
            return dataAny.balance || dataAny.booking?.balance || 0;
          }
          if (key === 'changedBy') {
            return dataAny.changedBy?.name || '';
          }
          if (key === 'changedAt') {
            return dataAny.changedAt || '';
          }
          if (key === 'action') {
            return dataAny.action || '';
          }
          
          return dataAny[col.key] !== undefined ? dataAny[col.key] : '';
        };
      }

      if (col.render) {
        def.cellRenderer = (params: ICellRendererParams<T>) =>
          params.data ? <div style={alignStyle}>{col.render!(params.data)}</div> : null;
      } else {
        def.cellStyle = col.align && col.align !== 'left' ? { textAlign: col.align } : undefined;
      }
      return def;
    });

    if (actions) {
      cols.push({
        headerName: 'Azioni',
        sortable: false,
        resizable: false,
        suppressMovable: true,
        width: 200,
        cellRenderer: (params: ICellRendererParams<T>) =>
          params.data ? <div style={{ ...CELL_WRAP_BASE, justifyContent: 'center' }}>{actions(params.data)}</div> : null,
      });
    }
    return cols;
  }, [columns, actions]);

  // 1. Error State
  if (hasError) {
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

  // 2. Loading State (Full overlay for initial load)
  if (isLoading && data.length === 0) {
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

  // 3. Empty State
  if (!isLoading && data.length === 0) {
    return (
      <Box sx={{ py: 8 }}>
        <StatePanel
          variant="empty"
          title={finalEmptyTitle}
          description={emptyDescription}
        />
      </Box>
    );
  }

  // 4. Responsive Layouts (Mobile card view)
  if (isSmall && renderCard) {
    return (
      <Stack spacing={2} sx={{ pb: 4 }}>
        {data.map((item) => (
          <Box key={keyExtractor(item)}>
            {renderCard(item)}
          </Box>
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Stack>
    );
  }

  // 5. Desktop Grid Layout (Ag-Grid)
  const ROW_HEIGHT = isSmall ? 48 : isMedium ? 56 : 64;
  const HEADER_HEIGHT = isSmall ? 40 : 44;
  const responsivePageSize = isSmall ? 4 : isMedium ? 6 : pageSize;
  const gridHeight = HEADER_HEIGHT + ROW_HEIGHT * responsivePageSize + PAGINATION_HEIGHT;

  return (
    <Box sx={(t) => styles.container(t)}>
      <Box 
        className="ag-theme-alpine-dark nagma-grid" 
        sx={{ width: '100%', height: `${gridHeight}px` }}
      >
        <AgGridReact<T>
          rowData={data}
          columnDefs={colDefs}
          getRowId={(p) => String(keyExtractor(p.data!))}
          getRowStyle={(p) => getRowStyle && p.data ? getRowStyle(p.data) : undefined}
          loading={isLoading}
          onRowClicked={(p) => onRowClick && p.data && onRowClick(p.data)}
          overlayNoRowsTemplate={`<span class="nagma-grid-empty">${finalEmptyTitle}</span>`}
          rowHeight={ROW_HEIGHT}
          headerHeight={HEADER_HEIGHT}
          pagination
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
