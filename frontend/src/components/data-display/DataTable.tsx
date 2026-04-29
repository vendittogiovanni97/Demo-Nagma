"use client";

import { useTheme as useThemeContext } from '@/context/ThemeContext';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AgGridReact } from 'ag-grid-react';
import React, { type ReactNode, useMemo } from 'react';
import { Box, Divider } from '@mui/material';

export interface Column<T> {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  render?: (item: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  actions?: (item: T) => ReactNode;
  keyExtractor: (item: T) => string | number;
  footer?: ReactNode;
  pageSize?: number;
  getRowStyle?: (item: T) => React.CSSProperties | undefined;
}

function parsePxWidth(width?: string): number | undefined {
  if (!width) return undefined;
  const m = width.match(/^(\d+(?:\.\d+)?)px$/);
  return m ? parseFloat(m[1]) : undefined;
}

type AgCellStyle = { [key: string]: string | number };

// STATIC PAGINATION HEIGHT - costante su tutti i breakpoint
const PAGINATION_HEIGHT = 48;

const CELL_WRAP: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  overflow: 'visible',
};

const CELL_WRAP_RIGHT: React.CSSProperties = { ...CELL_WRAP, justifyContent: 'flex-end' };
const CELL_WRAP_CENTER: React.CSSProperties = { ...CELL_WRAP, justifyContent: 'center' };

export default function DataTable<T extends object>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'Nessun dato trovato',
  actions,
  keyExtractor,
  footer,
  pageSize = 10,
  getRowStyle,
}: DataTableProps<T>) {
  // BREAKPOINT AWARENESS - ottieni flags responsive dal context
  const { isSmall, isMedium } = useThemeContext();
  const muiTheme = useMuiTheme();

  // RESPONSIVE SIZING - adatta al breakpoint attuale
  // ROW_HEIGHT: mobile 48px, tablet 56px, desktop 64px
  const ROW_HEIGHT = isSmall ? 48 : isMedium ? 56 : 64;

  // HEADER_HEIGHT: mobile 40px, desktop 44px
  const HEADER_HEIGHT = isSmall ? 40 : 44;

  // PAGE SIZE: mobile 4 righe, tablet 6, desktop 8
  const responsivePageSize = isSmall ? 4 : isMedium ? 6 : pageSize;

  // GRID HEIGHT - ricalcolato dinamicamente per ogni resize
  const gridHeight = HEADER_HEIGHT + ROW_HEIGHT * responsivePageSize + PAGINATION_HEIGHT;

  const safeColumns = columns.length > 0 ? columns : [{ key: '_empty', label: 'Nessun dato' }];

  const colDefs = useMemo<ColDef<T>[]>(() => {
    const cols: ColDef<T>[] = safeColumns.map((col) => {
      const pxWidth = parsePxWidth(col.width);
      const wrapStyle =
        col.align === 'right' ? CELL_WRAP_RIGHT :
        col.align === 'center' ? CELL_WRAP_CENTER :
        CELL_WRAP;

      const def: ColDef<T> = {
        headerName: col.label,
        sortable: true,
        resizable: true,
        filter: false,
        suppressMovable: true,
        ...(pxWidth ? { width: pxWidth } : { flex: 1 }),
      };

      if (col.render) {
        def.cellRenderer = (params: ICellRendererParams<T>) =>
          params.data ? <div style={wrapStyle}>{col.render!(params.data)}</div> : null;
      } else {
        def.cellStyle = col.align && col.align !== 'left'
          ? ({ textAlign: col.align } as AgCellStyle)
          : undefined;
        def.valueGetter = (params) =>
          params.data
            ? String((params.data as Record<string, unknown>)[col.key] ?? '')
            : '';
      }

      return def;
    });

    if (actions) {
      cols.push({
        headerName: 'Azioni',
        sortable: false,
        resizable: false,
        filter: false,
        suppressMovable: true,
        width: 170,
        cellRenderer: (params: ICellRendererParams<T>) =>
          params.data ? <div style={CELL_WRAP_CENTER}>{actions(params.data)}</div> : null,
      });
    }

    return cols;
  }, [safeColumns, actions]);

  return (
    <Box
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 3,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${muiTheme.palette.divider}`,
      }}
    >
      <Box
        className="ag-theme-alpine-dark nagma-grid"
        sx={{
          width: '100%',
          height: `${gridHeight}px`,
        }}
      >
        <AgGridReact<T>
          rowData={data}
          columnDefs={colDefs}
          getRowId={(params) => params.data ? String(keyExtractor(params.data)) : ''}
          getRowStyle={(params) => getRowStyle && params.data ? getRowStyle(params.data) : undefined}
          loading={isLoading}
          overlayNoRowsTemplate={`<span class="nagma-grid-empty">${emptyMessage}</span>`}
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
          domLayout="normal"
        />
      </Box>

      {footer && (
        <Box sx={{ borderTop: `1px solid ${muiTheme.palette.divider}` }}>
          {footer}
        </Box>
      )}
    </Box>
  );
}
