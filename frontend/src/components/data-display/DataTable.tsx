"use client";

import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AgGridReact } from 'ag-grid-react';
import React, { type ReactNode, useMemo } from 'react';

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
}

function parsePxWidth(width?: string): number | undefined {
  if (!width) return undefined;
  const m = width.match(/^(\d+(?:\.\d+)?)px$/);
  return m ? parseFloat(m[1]) : undefined;
}

type AgCellStyle = { [key: string]: string | number };

const ROW_HEIGHT = 100;
const HEADER_HEIGHT = 44;
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
  pageSize = 8,
}: DataTableProps<T>) {
  const gridHeight = HEADER_HEIGHT + ROW_HEIGHT * pageSize + PAGINATION_HEIGHT;

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
    <div className="glass-panel table-panel rounded-2xl overflow-hidden flex flex-col">
      <div
        className="ag-theme-alpine-dark nagma-grid"
        style={{ width: '100%', height: `${gridHeight}px` }}
      >
        <AgGridReact<T>
          rowData={data}
          columnDefs={colDefs}
          getRowId={(params) => params.data ? String(keyExtractor(params.data)) : ''}
          loading={isLoading}
          overlayNoRowsTemplate={`<span class="nagma-grid-empty">${emptyMessage}</span>`}
          rowHeight={ROW_HEIGHT}
          headerHeight={HEADER_HEIGHT}
          pagination
          paginationPageSize={pageSize}
          paginationPageSizeSelector={false}
          rowSelection={{ mode: 'multiRow', enableClickSelection: false }}
          suppressMovableColumns
          suppressCellFocus
          enableCellTextSelection
          animateRows
          defaultColDef={{ sortable: true, resizable: true, filter: false }}
        />
      </div>

      {footer && (
        <div className="border-t border-surface-border">
          {footer}
        </div>
      )}
    </div>
  );
}
