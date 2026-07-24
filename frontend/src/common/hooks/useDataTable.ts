'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR, { mutate as globalMutate } from 'swr';
import type {
  ColDef,
  ColumnVisibleEvent,
  GridApi,
  GridReadyEvent,
  ICellRendererParams,
  SortChangedEvent,
  ValueGetterParams,
} from 'ag-grid-community';
import { usePermission } from '@/common/providers/AuthProvider';
import {
  resolveExportColumns,
  buildMatrix,
  exportCsv,
  exportXlsx,
  exportPdf,
  slugifyFileName,
} from '../utils/exportTable';
import {
  ColumnDefinition,
  FetchParams,
  FilterChip,
  BaseColumnKey,
  ActionMode,
  columnPresets,
  ToolbarFilter,
  type DataTableResponse,
} from '../components/table/DataTable';
import type { TableAction } from '../components/table/TableActions';
import {
  getPreferredItemsPerPage,
  setPreferredItemsPerPage,
} from '@/common/shared/utils/pagination';

export interface UseDataTableOptions<E> {
  columns: ColumnDefinition<E>[];
  baseColumns: BaseColumnKey[];
  data?: E[];
  fetchData?: (params: FetchParams) => Promise<DataTableResponse<E>>;
  refreshKey?: unknown;
  queryKey?: string | unknown[];
  onRowClick?: (row: E) => void;
  renderRowActionStatus?: (row: E) => React.ReactNode;
  openEntityModal?: (
    action: ActionMode,
    row: E | undefined,
    onClose: () => void,
    onSuccess: () => void
  ) => React.ReactNode;
  onEdit?: (row: E) => void;
  onDelete?: (row: E) => void | Promise<void>;
  onView?: (row: E) => void;
  editPermission?: string;
  deletePermission?: string;
  viewPermission?: string;
  statusFilter?: string;
  statusFilterOptions?: FilterChip[];
  onStatusFilterChange?: (value: string | undefined) => void;
  columnVisibility?: Record<string, boolean>;
  onColumnVisibilityChange?: (newVisibility: Record<string, boolean>) => void;
  renderExpandedRow?: (row: E) => React.ReactNode;
  exportable?: boolean;
  exportFileName?: string;
  hideState?: boolean;
  onStatusChange?: (row: E) => Promise<void> | void;
  title?: string;
  ActionsCellRenderer: (params: ICellRendererParams) => React.ReactNode;
  ExpandCellRenderer: (params: ICellRendererParams) => React.ReactNode;
  toolbarFilters?: ToolbarFilter[];
  rowActions?: (row: E) => TableAction[];
}

export type DetailRow<E> = { __isDetailRow: true; __parentData: E };
export type RowWithId = { id?: string | number };

function normalizeResponse<E>(response: DataTableResponse<E>): { data: E[]; total: number } {
  if ('items' in response) {
    return { data: response.items, total: response.meta.totalItems };
  }
  return { data: response.data, total: response.total };
}

const BASE_COLUMNS_START: ('id' | 'createdAt' | 'updatedAt')[] = ['id'];
const BASE_COLUMNS_END: ('id' | 'createdAt' | 'updatedAt')[] = ['createdAt', 'updatedAt'];

export function useDataTable<E>(opts: UseDataTableOptions<E>) {
  const {
    columns,
    baseColumns,
    data = [],
    fetchData,
    refreshKey = 0,
    queryKey,
    onEdit,
    onDelete,
    onView,
    editPermission,
    deletePermission,
    viewPermission,
    statusFilter,
    statusFilterOptions,
    onStatusFilterChange,
    openEntityModal,
    columnVisibility,
    onColumnVisibilityChange,
    renderExpandedRow,
    renderRowActionStatus,
    exportable = true,
    exportFileName,
    hideState = false,
    onStatusChange,
    title,
    ActionsCellRenderer,
    ExpandCellRenderer,
    rowActions,
  } = opts;

  const { t } = useTranslation();

  const gridApiRef = useRef<GridApi | null>(null);
  const colBtnRef = useRef<HTMLButtonElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [colMenuAnchor, setColMenuAnchor] = useState<HTMLButtonElement | null>(null);
  const [toggleableCols, setToggleableCols] = useState<
    { colId: string; label: string; visible: boolean }[]
  >([]);
  const isManaged = !!fetchData;

  const canEdit = usePermission(editPermission ?? '');
  const canDelete = usePermission(deletePermission ?? '');
  const canView = usePermission(viewPermission ?? '');

  const [deleteTarget, setDeleteTarget] = useState<E | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [internalRefreshKey, setInternalRefreshKey] = useState(0);
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string | number>>(new Set());
  const [internalColumnVisibility, setInternalColumnVisibility] = useState<Record<string, boolean>>(
    {}
  );
  const activeColumnVisibility = useMemo(
    () => columnVisibility ?? internalColumnVisibility,
    [columnVisibility, internalColumnVisibility]
  );

  const [mPage, setMPageInternal] = useState(0);
  const [mLimit, setMLimitState] = useState<number>(getPreferredItemsPerPage);

  const setMLimit = useCallback((newLimit: number) => {
    setMLimitState(newLimit);
    setPreferredItemsPerPage(newLimit);
  }, []);

  const setMPage = useCallback((newPage: number) => {
    setMPageInternal(newPage);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);
  const [mSortKey, setMSortKey] = useState<string | null>(null);
  const [mSortOrder, setMSortOrder] = useState<'asc' | 'desc'>('asc');
  const [mData, setMData] = useState<E[]>([]);
  const [mTotal, setMTotal] = useState(0);
  const [isFetching, setIsFetching] = useState(false);

  const filterValuesStr = useMemo(() => {
    if (!opts.toolbarFilters) return '';
    return opts.toolbarFilters.map((filter) => `${filter.id}:${filter.value}`).join(',');
  }, [opts.toolbarFilters]);

  const toolbarFiltersRef = useRef(opts.toolbarFilters);
  useEffect(() => {
    toolbarFiltersRef.current = opts.toolbarFilters;
  });

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setMPage(0);
  }, [filterValuesStr]);

  const toggleExpand = useCallback((id: string | number) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const [internalStatusFilter, setInternalStatusFilter] = useState<string | undefined>(undefined);
  const activeStatusFilter =
    onStatusFilterChange !== undefined ? statusFilter : internalStatusFilter;
  const handleStatusFilterChange = onStatusFilterChange ?? setInternalStatusFilter;

  const activeStatusFilterOptions = statusFilterOptions;

  const isQueryEnabled = isManaged && !!queryKey;

  const dynamicQueryKey = useMemo(() => {
    if (!queryKey) return null;
    const base = Array.isArray(queryKey) ? queryKey : [queryKey];
    return [
      ...base,
      mPage,
      mLimit,
      searchTerm,
      mSortKey,
      mSortOrder,
      activeStatusFilter,
      refreshKey,
      internalRefreshKey,
      filterValuesStr,
    ];
  }, [
    queryKey,
    mPage,
    mLimit,
    searchTerm,
    mSortKey,
    mSortOrder,
    activeStatusFilter,
    refreshKey,
    internalRefreshKey,
    filterValuesStr,
  ]);

  const { data: swrResponse, error: swrError, isLoading: swrLoading, mutate: revalidate } = useSWR(
    isQueryEnabled ? dynamicQueryKey : null,
    async () => {
      const filter: Record<string, string> = {};
      if (activeStatusFilter) filter.status = activeStatusFilter;
      if (toolbarFiltersRef.current) {
        toolbarFiltersRef.current.forEach((filterItem) => {
          if (filterItem.value !== undefined && filterItem.value !== '') {
            filter[filterItem.id] = filterItem.value;
          }
        });
      }
      return fetchData!({
        page: mPage + 1,
        limit: mLimit,
        search: searchTerm || undefined,
        orderBy: mSortKey || undefined,
        orderDirection: mSortOrder,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
      });
    },
    { revalidateOnFocus: false, dedupingInterval: 1000 }
  );

  const rawData = useMemo(() => {
    if (isQueryEnabled) {
      return swrResponse ? normalizeResponse(swrResponse).data : [];
    }
    return isManaged ? mData : data;
  }, [isQueryEnabled, swrResponse, isManaged, mData, data]);

  const mTotalCount = isQueryEnabled
    ? (swrResponse ? normalizeResponse(swrResponse).total : 0)
    : mTotal;

  const activeFetching = isQueryEnabled ? swrLoading : isFetching;

  const fetchDataRef = useRef(fetchData);
  useEffect(() => {
    fetchDataRef.current = fetchData;
  });

  useEffect(() => {
    if (isQueryEnabled) return;
    if (!fetchDataRef.current) return;
    const filter: Record<string, string> = {};
    if (activeStatusFilter) filter.status = activeStatusFilter;
    if (toolbarFiltersRef.current) {
      toolbarFiltersRef.current.forEach((filterItem) => {
        if (filterItem.value !== undefined && filterItem.value !== '') {
          filter[filterItem.id] = filterItem.value;
        }
      });
    }
    setIsFetching(true);
    fetchDataRef
      .current({
        page: mPage + 1,
        limit: mLimit,
        search: searchTerm || undefined,
        orderBy: mSortKey || undefined,
        orderDirection: mSortOrder,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
      })
      .then((response) => {
        const normalized = normalizeResponse(response);
        setMData(normalized.data);
        setMTotal(normalized.total);
      })
      .catch(() => {
        setMData([]);
        setMTotal(0);
      })
      .finally(() => setIsFetching(false));
  }, [
    mPage,
    mLimit,
    mSortKey,
    mSortOrder,
    searchTerm,
    refreshKey,
    activeStatusFilter,
    internalRefreshKey,
    isQueryEnabled,
    filterValuesStr,
  ]);

  useEffect(() => {
    if (!gridApiRef.current || !columnVisibility) return;
    gridApiRef.current.applyColumnState({
      state: Object.entries(columnVisibility).map(([colId, visible]) => ({
        colId,
        hide: !visible,
      })),
    });
  }, [columnVisibility]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      if (isManaged) setMPage(0);
    },
    [isManaged, setMPage]
  );

  const handleSortChanged = useCallback(
    (event: SortChangedEvent) => {
      if (!isManaged) return;
      const sortCol = event.api.getColumnState().find((state) => state.sort);
      setMData([]);
      setMSortKey(sortCol?.colId ?? null);
      setMSortOrder((sortCol?.sort as 'asc' | 'desc') ?? 'asc');
      setMPage(0);
    },
    [isManaged, setMPage, setMSortKey, setMSortOrder, setMData]
  );

  const handleColumnVisible = useCallback(
    (event: ColumnVisibleEvent) => {
      if (!onColumnVisibilityChange) return;
      const cols = event.api.getColumns();
      if (!cols) return;
      const newVis: Record<string, boolean> = {};
      cols.forEach((col) => {
        newVis[col.getColId()] = col.isVisible();
      });
      onColumnVisibilityChange(newVis);
    },
    [onColumnVisibilityChange]
  );

  const openModal = useCallback(
    (action: ActionMode, row: E | undefined) => {
      if (!openEntityModal) return;
      setModalContent(
        openEntityModal(
          action,
          row,
          () => setModalContent(null),
          () => {
            setModalContent(null);
            if (isQueryEnabled) {
              globalMutate((key) => Array.isArray(key) && key[0] === queryKey);
            } else {
              setInternalRefreshKey((prev) => prev + 1);
            }
          }
        )
      );
    },
    [openEntityModal, isQueryEnabled, queryKey]
  );

  const allColumns = useMemo(() => {
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
  }, [columns, baseColumns, hideState]);

  const colDefs = useMemo<ColDef[]>(() => {
    const toColDef = (col: ColumnDefinition<E>): ColDef => ({
      field: col.key as string,
      headerName: t(col.label, col.label),
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

    if (renderExpandedRow) {
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

    if (
      onView ||
      onEdit ||
      onDelete ||
      onStatusChange ||
      renderRowActionStatus ||
      openEntityModal ||
      rowActions
    ) {
      defs.push({
        colId: '__actions',
        headerName: t('Azioni'),
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
  }, [
    allColumns,
    activeColumnVisibility,
    onView,
    onEdit,
    onDelete,
    onStatusChange,
    renderRowActionStatus,
    openEntityModal,
    ActionsCellRenderer,
    renderExpandedRow,
    ExpandCellRenderer,
    rowActions,
    t,
  ]);

  const onGridReady = useCallback((event: GridReadyEvent) => {
    gridApiRef.current = event.api;
  }, []);

  const readToggleableCols = useCallback(() => {
    if (!gridApiRef.current) return [];
    return (gridApiRef.current.getColumns() ?? [])
      .filter(
        (col) =>
          col.getColId() !== '__actions' &&
          col.getColId() !== '__expand' &&
          col.getColDef().headerName
      )
      .map((col) => ({
        colId: col.getColId(),
        label: col.getColDef().headerName as string,
        visible: col.isVisible(),
      }));
  }, []);

  const handleOpenColMenu = useCallback(() => {
    setToggleableCols(readToggleableCols());
    setColMenuAnchor(colBtnRef.current);
  }, [readToggleableCols]);

  const handleColVisToggle = useCallback(
    (colId: string, visible: boolean) => {
      gridApiRef.current?.setColumnsVisible([colId], visible);
      setToggleableCols((prev) =>
        prev.map((col) => (col.colId === colId ? { ...col, visible } : col))
      );
      if (onColumnVisibilityChange) {
        const cols = gridApiRef.current?.getColumns() ?? [];
        const newVis: Record<string, boolean> = {};
        cols.forEach((col) => {
          newVis[col.getColId()] = col.isVisible();
        });
        onColumnVisibilityChange(newVis);
      } else {
        setInternalColumnVisibility((prev) => ({
          ...prev,
          [colId]: visible,
        }));
      }
    },
    [onColumnVisibilityChange]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget || !onDelete) return;
    setDeleteLoading(true);
    try {
      await onDelete(deleteTarget);
      if (isQueryEnabled) {
        globalMutate((key) => Array.isArray(key) && key[0] === queryKey);
      } else {
        setInternalRefreshKey((prev) => prev + 1);
      }
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, onDelete, isQueryEnabled, queryKey]);

  const [exportAnchor, setExportAnchor] = useState<HTMLButtonElement | null>(null);
  const [exporting, setExporting] = useState(false);

  const buildExportColumns = useCallback(() => {
    return resolveExportColumns<E>(allColumns, (key) => t(key, key));
  }, [allColumns, t]);

  const collectAllRows = useCallback(async (): Promise<E[]> => {
    if (!fetchData) return rawData;
    const filter: Record<string, string> = {};
    if (activeStatusFilter) filter.status = activeStatusFilter;
    const pageSize = 100;
    const accumulatedItems: E[] = [];
    let page = 1;
    let total = Infinity;
    while (accumulatedItems.length < total && page <= 1000) {
      const res = await fetchData({
        page,
        limit: pageSize,
        search: searchTerm || undefined,
        orderBy: mSortKey || undefined,
        orderDirection: mSortOrder,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
      });
      const normalized = normalizeResponse(res);
      accumulatedItems.push(...normalized.data);
      total = normalized.total;
      if (normalized.data.length < pageSize) break;
      page++;
    }
    return accumulatedItems;
  }, [fetchData, rawData, activeStatusFilter, searchTerm, mSortKey, mSortOrder]);

  const runExport = useCallback(
    async (scope: 'current' | 'all', format: 'csv' | 'xlsx' | 'pdf') => {
      setExportAnchor(null);
      setExporting(true);
      try {
        const rows = scope === 'all' ? await collectAllRows() : rawData;
        const cols = buildExportColumns();
        const { headers, data: matrix } = buildMatrix(cols, rows);
        const fileName = exportFileName ?? (title ? slugifyFileName(title) : 'export');
        if (format === 'csv') await exportCsv(fileName, headers, matrix);
        else if (format === 'xlsx') await exportXlsx(fileName, headers, matrix);
        else if (format === 'pdf') await exportPdf(fileName, headers, matrix);
      } finally {
        setExporting(false);
      }
    },
    [collectAllRows, rawData, buildExportColumns, exportFileName, title]
  );

  const showExport = exportable && (isManaged || rawData.length > 0);

  const rowData = useMemo(() => {
    if (!renderExpandedRow) return rawData;
    const result: (E | DetailRow<E>)[] = [];
    for (const row of rawData) {
      result.push(row);
      const id = (row as RowWithId).id;
      if (id !== undefined && expandedRowIds.has(id)) {
        result.push({ __isDetailRow: true, __parentData: row });
      }
    }
    return result;
  }, [rawData, renderExpandedRow, expandedRowIds]);

  return {
    searchTerm,
    handleSearchChange,
    mPage,
    setMPage,
    mLimit,
    setMLimit,
    handleSortChanged,
    activeStatusFilter,
    handleStatusFilterChange,
    activeStatusFilterOptions,
    activeFetching,
    rawData,
    mTotalCount,
    expandedRowIds,
    toggleExpand,
    deleteTarget,
    setDeleteTarget,
    deleteLoading,
    handleDeleteConfirm,
    colMenuAnchor,
    setColMenuAnchor,
    toggleableCols,
    handleOpenColMenu,
    handleColVisToggle,
    exportAnchor,
    setExportAnchor,
    exporting,
    runExport,
    showExport,
    colDefs,
    rowData,
    gridApiRef,
    onGridReady,
    handleColumnVisible,
    modalContent,
    openModal,
    colBtnRef,
    canEdit,
    canDelete,
    canView,
    isManaged,
  };
}
