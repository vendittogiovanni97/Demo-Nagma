'use client';

import { MonoText } from '@/common/components/ui/MonoText';
import { StatusChip } from '@/common/components/ui/StatusChip';
import { formatDate } from '@/common/shared/utils/format';
import type { ColDef, ICellRendererParams, ValueGetterParams } from 'ag-grid-community';
import React from 'react';

// ─── 1. COLUMN TYPES & INTERFACES ─────────────────────────────────────────────

export type ColumnAlign = 'left' | 'center' | 'right';

export interface ColumnDefinition<E> {
  key: keyof E | string;
  label: string;
  align?: ColumnAlign;
  render?: (row: E) => React.ReactNode;
  sortable?: boolean;
  sortValue?: (row: E) => string | number | null | undefined;
  minWidth?: number;
  maxWidth?: number;
  flex?: number;
  exportValue?: (row: E) => string | number | boolean | Date | null | undefined;
  exportable?: boolean;
}

export type BaseColumnKey = 'id' | 'createdAt' | 'updatedAt';

export const DEFAULT_BASE_COLUMNS: BaseColumnKey[] = ['id'];

export const DEFAULT_COL_DEF = {
  flex: 1,
  minWidth: 100,
  cellStyle: { display: 'flex', alignItems: 'center', height: '100%' },
} as const;

const BASE_COLUMNS_START: BaseColumnKey[] = ['id'];
const BASE_COLUMNS_END: BaseColumnKey[] = ['createdAt', 'updatedAt'];

// ─── 2. STANDARD COLUMN PRESETS ───────────────────────────────────────────────

export const columnPresets = {
  id: {
    key: 'id',
    label: 'ID',
    maxWidth: 90,
    minWidth: 60,
    sortable: true,
    render: (row: Record<string, unknown>) => <MonoText>{row.id as React.ReactNode}</MonoText>,
  } as ColumnDefinition<Record<string, unknown>>,
  createdAt: {
    key: 'createdAt',
    label: 'Creato il',
    minWidth: 150,
    sortable: true,
    render: (row: Record<string, unknown>) => (
      <MonoText>{formatDate(row.createdAt as string | Date)}</MonoText>
    ),
  } as ColumnDefinition<Record<string, unknown>>,
  updatedAt: {
    key: 'updatedAt',
    label: 'Aggiornato il',
    minWidth: 150,
    sortable: true,
    render: (row: Record<string, unknown>) => (
      <MonoText>{formatDate(row.updatedAt as string | Date)}</MonoText>
    ),
  } as ColumnDefinition<Record<string, unknown>>,
  status: {
    key: 'status',
    label: 'Stato',
    minWidth: 100,
    sortable: true,
    align: 'center',
    render: (row: Record<string, unknown>) => <StatusChip status={row.status as string} />,
  } as ColumnDefinition<Record<string, unknown>>,
  actions: {
    key: '__actions',
    label: 'Azioni',
    flex: 1.25,
    minWidth: 196,
    sortable: false,
  } as ColumnDefinition<Record<string, unknown>>,
};

// ─── 3. COLUMN RESOLVER & AG-GRID MAPPER ──────────────────────────────────────

export interface BuildColumnsOptions<E> {
  columns: ColumnDefinition<E>[];
  baseColumns?: BaseColumnKey[];
  hideState?: boolean;
}

export function buildAllColumns<E>({
  columns,
  baseColumns = ['id'],
  hideState = false,
}: BuildColumnsOptions<E>): ColumnDefinition<E>[] {
  const consumerKeys = new Set(columns.map((col) => col.key as string));

  const startBase = BASE_COLUMNS_START.filter(
    (key) => baseColumns.includes(key) && !consumerKeys.has(key)
  ).map((key) => columnPresets[key] as ColumnDefinition<E>);

  const endBase = BASE_COLUMNS_END.filter(
    (key) => baseColumns.includes(key) && !consumerKeys.has(key)
  ).map((key) => columnPresets[key] as ColumnDefinition<E>);

  const autoStatus =
    !hideState && !consumerKeys.has('status')
      ? [columnPresets.status as ColumnDefinition<E>]
      : [];

  return [...startBase, ...columns, ...autoStatus, ...endBase].filter(
    (col) => !(hideState && col.key === 'status')
  );
}

export interface MapAgGridColDefsOptions<E> {
  allColumns: ColumnDefinition<E>[];
  activeColumnVisibility: Record<string, boolean>;
  translate: (key: string, defaultValue?: string) => string;
  hasExpandRow?: boolean;
  ExpandCellRenderer?: (params: ICellRendererParams) => React.ReactNode;
  hasActionsColumn?: boolean;
  ActionsCellRenderer?: (params: ICellRendererParams) => React.ReactNode;
}

export function mapToAgGridColDefs<E>({
  allColumns,
  activeColumnVisibility,
  translate,
  hasExpandRow,
  ExpandCellRenderer,
  hasActionsColumn,
  ActionsCellRenderer,
}: MapAgGridColDefsOptions<E>): ColDef[] {
  const toColDef = (col: ColumnDefinition<E>): ColDef => ({
    field: col.key as string,
    headerName: translate(col.label, col.label),
    sortable: col.sortable !== false,
    hide: activeColumnVisibility[col.key as string] === false,
    cellDataType: false,
    headerClass:
      col.align === 'center'
        ? 'ag-header-cell-align-center'
        : col.align === 'right'
          ? 'ag-header-cell-align-right'
          : 'ag-header-cell-align-left',
    flex: col.flex ?? 1,
    ...(col.minWidth !== undefined ? { minWidth: col.minWidth } : {}),
    ...(col.maxWidth !== undefined ? { maxWidth: col.maxWidth } : {}),
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      justifyContent:
        col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start',
    },
    cellRenderer: col.render
      ? (params: ICellRendererParams) => (params.data ? col.render!(params.data as E) : null)
      : undefined,
    ...(col.sortValue
      ? {
          valueGetter: (params: ValueGetterParams) =>
            params.data ? col.sortValue!(params.data as E) : undefined,
        }
      : {}),
  });

  const defs = allColumns.map(toColDef);

  if (hasExpandRow && ExpandCellRenderer) {
    defs.unshift({
      colId: '__expand',
      headerName: '',
      sortable: false,
      width: 48,
      minWidth: 48,
      maxWidth: 48,
      suppressMovable: true,
      cellRenderer: ExpandCellRenderer,
      headerClass: 'ag-header-cell-align-center',
      cellStyle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      },
    });
  }

  if (hasActionsColumn && ActionsCellRenderer) {
    defs.push({
      colId: '__actions',
      headerName: translate('Azioni'),
      sortable: false,
      headerClass: 'ag-header-cell-align-center',
      cellRenderer: ActionsCellRenderer,
      cellStyle: {
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        justifyContent: 'center',
      },
      flex: 1.25,
      minWidth: 196,
      suppressMovable: true,
    });
  }

  return defs;
}
