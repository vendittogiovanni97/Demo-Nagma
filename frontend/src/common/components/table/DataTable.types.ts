import type { RowStyle } from 'ag-grid-community';
import type React from 'react';

import type { BaseColumnKey, ColumnDefinition } from './TableColumns';

export type TableActionTone =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'whatsapp';

export interface TableAction {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
  tone?: TableActionTone;
  hidden?: boolean;
  disabled?: boolean;
  loading?: boolean;
  adminOnly?: boolean;
}

export interface FetchParams {
  page: number;
  limit: number;
  search?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filter?: Record<string, string>;
}

export interface DataTableResponse<E> {
  data: E[];
  total: number;
}

interface DataTableBaseProps<E> {
  columns: ColumnDefinition<E>[];
  baseColumns?: BaseColumnKey[];
  keyExtractor?: (row: E) => string | number;
  rowActions?: (row: E) => TableAction[];
  renderCard?: (row: E) => React.ReactNode;
  getRowStyle?: (row: E) => RowStyle | undefined;
  isLoading?: boolean;
  hideState?: boolean;
  hideToolbar?: boolean;
  pageSize?: number;
  footerContent?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;

  onDelete?: (row: E) => void | Promise<void>;
  deleteConfirmTitle?: string;
  deleteConfirmMessage?: string;
}

type LocalDataSource<E> = {
  data: E[];
  fetchData?: never;
  refreshKey?: never;
};

type RemoteDataSource<E> = {
  fetchData: (params: FetchParams) => Promise<DataTableResponse<E>>;
  data?: never;
  refreshKey?: unknown;
};

export type DataTableProps<E> = DataTableBaseProps<E> & (LocalDataSource<E> | RemoteDataSource<E>);

export type DetailRow<E> = { __isDetailRow: true; __parentData: E };
export type RowWithId = { id?: string | number };
