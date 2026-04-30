"use client";

import React, { ReactNode, useMemo } from 'react';
import { Box, SxProps, Theme, useTheme } from '@mui/material';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ICellRendererParams, RowStyle } from 'ag-grid-community';
import { useTheme as useThemeContext } from '@/context/ThemeContext';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

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
  getRowStyle?: (item: T) => RowStyle | undefined;
}

const PAGINATION_HEIGHT = 48;

const CELL_WRAP_BASE: React.CSSProperties = {
  display: 'flex', alignItems: 'center', width: '100%', overflow: 'visible',
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
  emptyMessage = 'Nessun dato trovato',
  actions,
  keyExtractor,
  footer,
  pageSize = 10,
  getRowStyle,
}: DataTableProps<T>) {
  const { isSmall, isMedium } = useThemeContext();
  const theme = useTheme();

  const ROW_HEIGHT = isSmall ? 48 : isMedium ? 56 : 64;
  const HEADER_HEIGHT = isSmall ? 40 : 44;
  const responsivePageSize = isSmall ? 4 : isMedium ? 6 : pageSize;
  const gridHeight = HEADER_HEIGHT + ROW_HEIGHT * responsivePageSize + PAGINATION_HEIGHT;

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
        sortable: true, resizable: true, suppressMovable: true,
        ...(pxWidth ? { width: pxWidth } : { flex: 1 }),
      };

      if (col.render) {
        def.cellRenderer = (params: ICellRendererParams<T>) =>
          params.data ? <div style={alignStyle}>{col.render!(params.data)}</div> : null;
      } else {
        def.cellStyle = col.align && col.align !== 'left' ? { textAlign: col.align } : undefined;
        def.valueGetter = (params) => params.data ? String((params.data as any)[col.key] ?? '') : '';
      }
      return def;
    });

    if (actions) {
      cols.push({
        headerName: 'Azioni',
        sortable: false, resizable: false, suppressMovable: true, width: 170,
        cellRenderer: (params: ICellRendererParams<T>) =>
          params.data ? <div style={{ ...CELL_WRAP_BASE, justifyContent: 'center' }}>{actions(params.data)}</div> : null,
      });
    }
    return cols;
  }, [columns, actions]);

  return (
    <Box sx={styles.container}>
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
  container: {
    bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 3,
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
    border: '1px solid', borderColor: 'divider'
  } as SxProps<Theme>,
  footer: {
    borderTop: '1px solid', borderColor: 'divider'
  } as SxProps<Theme>,
};
