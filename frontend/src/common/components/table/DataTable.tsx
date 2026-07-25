'use client';

import type {
  ColumnVisibleEvent,
  GridApi,
  GridReadyEvent,
  ICellRendererParams,
  IsFullWidthRowParams,
  RowStyle,
  SortChangedEvent
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import useSWR, { mutate as globalMutate } from 'swr';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { alpha, useTheme } from '@mui/material/styles';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Search } from 'lucide-react';

import PermissionGate from '@/common/components/auth/PermissionGate';
import FormSelect from '@/common/components/forms/FormSelect';
import Button, { CreateButton } from '@/common/components/ui/Button';
import Icon from '@/common/components/ui/Icon';
import Input from '@/common/components/ui/Input';
import StatusToggleButton from '@/common/components/ui/StatusToggleButton';
import { ConfirmDialog } from '../ui/ConfirmDialog';

import { usePermission } from '@/common/providers/AuthProvider';
import { useThemeMode } from '@/common/providers/ThemeModeProvider';
import {
  getPreferredItemsPerPage,
  PAGE_SIZE_OPTIONS,
  setPreferredItemsPerPage,
} from '@/common/shared/utils/pagination';
import {
  buildMatrix,
  exportCsv,
  exportPdf,
  exportXlsx,
  getRowStatus,
  isDetailRow,
  normalizeResponse,
  resolveActionColor,
  resolveExportColumns,
  slugifyFileName,
} from './utils/utils';

// ─── 1. ENUMS & TYPES ─────────────────────────────────────────────────────────

export enum ActionMode {
  Create = 'Create',
  Read = 'Read',
  Edit = 'Edit',
  Delete = 'Delete',
}

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

export interface DataTableRef<E = unknown> {
  openCreateModal: () => void;
  openEditModal: (item: E) => void;
  openReadModal: (item: E) => void;
}

import {
  buildAllColumns,
  columnPresets,
  DEFAULT_BASE_COLUMNS,
  DEFAULT_COL_DEF,
  mapToAgGridColDefs,
  type BaseColumnKey,
  type ColumnAlign,
  type ColumnDefinition,
} from './TableColumns';

export { buildAllColumns, columnPresets, DEFAULT_BASE_COLUMNS, DEFAULT_COL_DEF, mapToAgGridColDefs };
export type { BaseColumnKey, ColumnAlign, ColumnDefinition };

export interface FilterChip {
  label: string;
  value: string;
}

export interface ToolbarFilter {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  minWidth?: number;
}

export interface FetchParams {
  page: number;
  limit: number;
  search?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filter?: Record<string, string>;
}

export type DataTableResponse<E> =
  | { items: E[]; meta: { totalItems: number } }
  | { data: E[]; total: number };

// ─── 2. OVERLAYS & ACTION BUTTONS ─────────────────────────────────────────────

export interface DataTableProps<E> {
  title?: string;
  subtitle?: string;
  createLabel?: string;
  onCreateClick?: () => void;
  error?: string | null;
  onErrorClose?: () => void;

  columns: ColumnDefinition<E>[];
  baseColumns?: BaseColumnKey[];
  data?: E[];
  fetchData?: (params: FetchParams) => Promise<DataTableResponse<E>>;
  refreshKey?: unknown;
  queryKey?: string | unknown[];
  onRowClick?: (row: E) => void;
  keyExtractor?: (row: E) => string | number;
  emptyMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  searchPlaceholder?: string;
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
  deleteConfirmTitle?: string;
  deleteConfirmMessage?: string;
  statusFilter?: string;
  statusFilterOptions?: FilterChip[];
  onStatusFilterChange?: (value: string | undefined) => void;
  onRefresh?: () => void;
  columnVisibility?: Record<string, boolean>;
  onColumnVisibilityChange?: (newVisibility: Record<string, boolean>) => void;
  renderExpandedRow?: (row: E) => React.ReactNode;
  renderCard?: (row: E) => React.ReactNode;
  exportable?: boolean;
  exportFileName?: string;
  hideState?: boolean;
  onStatusChange?: (row: E) => Promise<void> | void;
  extraToolbarActions?: React.ReactNode;
  toolbarFilters?: ToolbarFilter[];
  isLoading?: boolean;
  hasError?: boolean;
  pageSize?: number;
  pageSizeSelector?: number[];
  getRowStyle?: (row: E) => RowStyle | undefined;
  rowActions?: (row: E) => TableAction[];
  hideToolbar?: boolean;
  footerContent?: React.ReactNode;
}

export type DataTableParams<E> = Omit<
  DataTableProps<E>,
  'refreshKey' | 'statusFilter' | 'onStatusFilterChange' | 'data'
>;

export type DetailRow<E> = { __isDetailRow: true; __parentData: E };
export type RowWithId = { id?: string | number };

// ─── 3. OVERLAYS & ACTION BUTTONS ─────────────────────────────────────────────

// ─── 3. OVERLAYS & ACTION BUTTONS ─────────────────────────────────────────────

const LoadingOverlay = () => (
  <Box
    className="ag-custom-loading"
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      p: 2,
      borderRadius: 2,
      bgcolor: 'background.paper',
      boxShadow: 3,
    }}
  >
    <CircularProgress size={20} />
    <Typography variant="body2">Caricamento in corso...</Typography>
  </Box>
);

const NoRowsOverlay = (props: { message?: string }) => {
  const { t } = useTranslation();
  return (
    <Box className="ag-custom-no-rows" sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="body2" color="text.secondary">
        {props.message || t('Nessun dato disponibile')}
      </Typography>
    </Box>
  );
};

function ActionButton({ action }: { action: TableAction }) {
  const tone = action.tone ?? 'default';

  return (
    <Button
      variant="icon"
      title={action.label}
      aria-label={action.label}
      icon={<Icon name={action.icon} size={18} />}
      onClick={action.onClick}
      disabled={action.disabled}
      isLoading={action.loading}
      sx={(theme) => {
        const color = resolveActionColor(theme, tone);
        return {
          color,
          '&:hover': {
            color,
            backgroundColor: alpha(color, 0.12),
          },
          '&:focus-visible': {
            outline: `2px solid ${color}`,
            outlineOffset: 2,
          },
        };
      }}
    />
  );
}

export function TableActions({ actions }: { actions: TableAction[] }) {
  const visibleActions = actions.filter((action) => !action.hidden);
  if (visibleActions.length === 0) return null;

  return (
    <Box
      onClick={(event) => event.stopPropagation()}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}
    >
      {visibleActions.map((action) =>
        action.adminOnly ? (
          <PermissionGate key={action.id} requireAdmin>
            <ActionButton action={action} />
          </PermissionGate>
        ) : (
          <ActionButton key={action.id} action={action} />
        ),
      )}
    </Box>
  );
}

const TableActionsGroup = TableActions;

// ─── 4. TOOLBAR COMPONENT ─────────────────────────────────────────────────────

interface DataTableToolbarProps {
  onRefresh?: () => void;
  hideState?: boolean;
  activeStatusFilterOptions?: FilterChip[];
  activeStatusFilter?: string;
  onStatusFilterChange: (val: string | undefined) => void;
  onPageReset: () => void;
  toolbarFilters?: ToolbarFilter[];
  extraToolbarActions?: React.ReactNode;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  colBtnRef: React.RefObject<HTMLButtonElement | null>;
  onOpenColMenu: () => void;
  colMenuAnchor: HTMLButtonElement | null;
  onColMenuClose: () => void;
  toggleableCols: { colId: string; label: string; visible: boolean }[];
  onColVisToggle: (colId: string, visible: boolean) => void;
  showExport: boolean;
  exporting: boolean;
  exportAnchor: HTMLButtonElement | null;
  onExportClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onExportClose: () => void;
  onRunExport: (scope: 'current' | 'all', format: 'csv' | 'xlsx' | 'pdf') => void;
  isManaged?: boolean;
}

function DataTableToolbar({
  onRefresh,
  hideState,
  activeStatusFilterOptions,
  activeStatusFilter,
  onStatusFilterChange,
  onPageReset,
  toolbarFilters,
  extraToolbarActions,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  colBtnRef,
  onOpenColMenu,
  colMenuAnchor,
  onColMenuClose,
  toggleableCols,
  onColVisToggle,
  showExport,
  exporting,
  exportAnchor,
  onExportClick,
  onExportClose,
  onRunExport,
  isManaged,
}: DataTableToolbarProps) {
  const { t } = useTranslation();

  return (
    <Box
      className="table-toolbar"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        mb: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', flex: 1 }}>
        <Input
          type="search"
          placeholder={searchPlaceholder ?? t('Cerca...')}
          value={searchTerm}
          onChange={onSearchChange}
          icon={Search}
          size="sm"
          sx={{ minWidth: 220, maxWidth: 360 }}
        />

        {!hideState && activeStatusFilterOptions && activeStatusFilterOptions.length > 0 && (
          <FormSelect
            size="small"
            value={activeStatusFilter ?? ''}
            onChange={(val: string) => {
              onStatusFilterChange(val === '' ? undefined : val);
              onPageReset();
            }}
            options={[
              { value: '', label: t('Tutti gli stati') },
              ...activeStatusFilterOptions.map((opt) => ({
                value: opt.value,
                label: opt.label,
              })),
            ]}
            sx={{ minWidth: 150 }}
          />
        )}

        {toolbarFilters?.map((tf) => (
          <FormSelect
            key={tf.id}
            size="small"
            value={tf.value}
            onChange={(val: string) => {
              tf.onChange(val);
              onPageReset();
            }}
            options={tf.options}
            sx={{ minWidth: tf.minWidth ?? 140 }}
          />
        ))}

        {extraToolbarActions}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            icon={<Icon name="refresh" size={16} />}
            title={t('Ricarica dati')}
          />
        )}

        <Button
          ref={colBtnRef}
          variant="ghost"
          size="sm"
          onClick={onOpenColMenu}
          icon={<Icon name="colonne" size={16} />}
        >
          {t('Colonne')}
        </Button>

        <Menu anchorEl={colMenuAnchor} open={Boolean(colMenuAnchor)} onClose={onColMenuClose}>
          {toggleableCols.map((col) => (
            <MenuItem
              key={col.colId}
              onClick={() => onColVisToggle(col.colId, !col.visible)}
              dense
            >
              <Checkbox checked={col.visible} size="small" />
              <ListItemText primary={col.label} />
            </MenuItem>
          ))}
        </Menu>

        {showExport && (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={onExportClick}
              isLoading={exporting}
              icon={<Icon name="download" size={16} />}
            >
              {t('Esporta')}
            </Button>
            <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={onExportClose}>
              <MenuItem onClick={() => onRunExport('current', 'csv')}>
                {t('Pagina corrente (CSV)')}
              </MenuItem>
              <MenuItem onClick={() => onRunExport('current', 'xlsx')}>
                {t('Pagina corrente (Excel)')}
              </MenuItem>
              <MenuItem onClick={() => onRunExport('current', 'pdf')}>
                {t('Pagina corrente (PDF)')}
              </MenuItem>
              {isManaged && [
                <MenuItem key="all-csv" onClick={() => onRunExport('all', 'csv')}>
                  {t('Tutti i dati (CSV)')}
                </MenuItem>,
                <MenuItem key="all-xlsx" onClick={() => onRunExport('all', 'xlsx')}>
                  {t('Tutti i dati (Excel)')}
                </MenuItem>,
                <MenuItem key="all-pdf" onClick={() => onRunExport('all', 'pdf')}>
                  {t('Tutti i dati (PDF)')}
                </MenuItem>,
              ]}
            </Menu>
          </>
        )}
      </Box>
    </Box>
  );
}

// ─── 6. MAIN DATATABLE IMPLEMENTATION ─────────────────────────────────────────

const DataTableComponent = <E,>(props: DataTableProps<E>, ref: React.Ref<DataTableRef<E>>) => {
  const {
    title,
    subtitle,
    createLabel,
    onCreateClick,
    error,
    onErrorClose,
    columns,
    baseColumns = DEFAULT_BASE_COLUMNS,
    data = [],
    fetchData,
    refreshKey = 0,
    queryKey,
    onRowClick,
    emptyMessage,
    emptyTitle,
    emptyDescription,
    searchPlaceholder,
    renderRowActionStatus,
    openEntityModal,
    onEdit,
    onDelete,
    onView,
    editPermission,
    deletePermission,
    viewPermission,
    deleteConfirmTitle,
    deleteConfirmMessage,
    statusFilter,
    statusFilterOptions,
    onStatusFilterChange,
    onRefresh,
    columnVisibility,
    onColumnVisibilityChange,
    renderExpandedRow,
    renderCard,
    exportable = true,
    exportFileName,
    hideState = false,
    onStatusChange,
    extraToolbarActions,
    toolbarFilters,
    isLoading,
    pageSize,
    pageSizeSelector,
    getRowStyle,
    rowActions,
    hideToolbar = false,
    footerContent,
  } = props;

  const { t } = useTranslation();
  const { resolvedTheme } = useThemeMode();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const effectiveEmptyMessage =
    emptyMessage ??
    (emptyTitle ? `${emptyTitle}${emptyDescription ? ` - ${emptyDescription}` : ''}` : undefined) ??
    t('Nessun dato disponibile');
  const effectiveDeleteConfirmTitle = deleteConfirmTitle ?? t('Conferma eliminazione');
  const effectiveDeleteConfirmMessage =
    deleteConfirmMessage ?? t('Sei sicuro di voler eliminare questo elemento?');

  const canEdit = usePermission(editPermission ?? '');
  const canDelete = usePermission(deletePermission ?? '');
  const canView = usePermission(viewPermission ?? '');

  const isManaged = !!fetchData;
  const gridApiRef = useRef<GridApi | null>(null);
  const colBtnRef = useRef<HTMLButtonElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [colMenuAnchor, setColMenuAnchor] = useState<HTMLButtonElement | null>(null);
  const [toggleableCols, setToggleableCols] = useState<
    { colId: string; label: string; visible: boolean }[]
  >([]);

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
    if (!toolbarFilters) return '';
    return toolbarFilters.map((filter) => `${filter.id}:${filter.value}`).join(',');
  }, [toolbarFilters]);

  const toolbarFiltersRef = useRef(toolbarFilters);
  useEffect(() => {
    toolbarFiltersRef.current = toolbarFilters;
  });

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setMPage(0);
  }, [filterValuesStr, setMPage]);

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

  const { data: swrResponse, isLoading: swrLoading } = useSWR(
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
    ? swrResponse
      ? normalizeResponse(swrResponse).total
      : 0
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
    [isManaged, setMPage]
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

  const actionsRef = useRef<{
    openModal: (action: ActionMode, row: E | undefined) => void;
    setDeleteTarget: (row: E | null) => void;
    toggleExpand: (id: string | number) => void;
    expandedRowIds: Set<string | number>;
  }>({
    openModal: () => {},
    setDeleteTarget: () => {},
    toggleExpand: () => {},
    expandedRowIds: new Set(),
  });

  useEffect(() => {
    actionsRef.current = { openModal, setDeleteTarget, toggleExpand, expandedRowIds };
  });

  useImperativeHandle(ref, () => ({
    openCreateModal: () => {
      openModal(ActionMode.Create, undefined);
    },
    openEditModal: (item: E) => {
      openModal(ActionMode.Edit, item);
    },
    openReadModal: (item: E) => {
      openModal(ActionMode.Read, item);
    },
  }));

  const activeRowActionStatus = useMemo(() => {
    if (renderRowActionStatus) {
      return renderRowActionStatus;
    }
    if (onStatusChange) {
      return function StatusToggleCell(row: E) {
        return (
          <StatusToggleButton
            currentStatus={getRowStatus(row)}
            onClick={() => onStatusChange(row)}
          />
        );
      };
    }
    return undefined;
  }, [renderRowActionStatus, onStatusChange]);

  const ActionsCellRenderer = useCallback(
    (params: ICellRendererParams) => {
      const row = params.data as E;
      if (!row) return null;
      const showView = (onView || openEntityModal) && (!viewPermission || canView);
      const showEdit = (onEdit || openEntityModal) && (!editPermission || canEdit);
      const showDelete = onDelete && (!deletePermission || canDelete);
      const configuredActions: TableAction[] = rowActions?.(row) ?? [];
      const automaticActions: TableAction[] = [
        {
          id: 'view',
          label: t('Visualizza'),
          icon: 'vedi',
          tone: 'primary',
          hidden: !showView,
          onClick: () =>
            onView
              ? onView(row)
              : openEntityModal
                ? actionsRef.current.openModal(ActionMode.Read, row)
                : undefined,
        },
        {
          id: 'edit',
          label: t('Modifica'),
          icon: 'pencil',
          tone: 'primary',
          hidden: !showEdit,
          onClick: () =>
            openEntityModal ? actionsRef.current.openModal(ActionMode.Edit, row) : onEdit!(row),
        },
        {
          id: 'delete',
          label: t('Elimina'),
          icon: 'cestino',
          tone: 'error',
          hidden: !showDelete,
          onClick: () => actionsRef.current.setDeleteTarget(row),
        },
      ];
      return (
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', height: '100%' }}>
          <TableActionsGroup actions={[...configuredActions, ...automaticActions]} />
          {renderRowActionStatus
            ? renderRowActionStatus(row)
            : !hideState && activeRowActionStatus?.(row)}
        </Box>
      );
    },
    [
      onView,
      onEdit,
      onDelete,
      openEntityModal,
      activeRowActionStatus,
      canView,
      canEdit,
      canDelete,
      viewPermission,
      editPermission,
      deletePermission,
      hideState,
      renderRowActionStatus,
      rowActions,
      t,
    ]
  );

  const FullWidthDetailCellRenderer = useCallback(
    (params: ICellRendererParams) => {
      const detailRow = params.data as DetailRow<E> | undefined;
      if (!detailRow?.__isDetailRow || !renderExpandedRow) return null;
      return (
        <Box
          sx={{ p: 2, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}
        >
          {renderExpandedRow(detailRow.__parentData)}
        </Box>
      );
    },
    [renderExpandedRow]
  );

  const ExpandCellRenderer = useCallback((params: ICellRendererParams) => {
    const row = params.data as RowWithId | undefined;
    if (row?.id === undefined) return null;
    const id = row.id;
    const isExpanded = actionsRef.current.expandedRowIds.has(id);
    return (
      <IconButton size="small" onClick={() => actionsRef.current.toggleExpand(id)}>
        {isExpanded ? <Icon name="chevronUp" size={16} /> : <Icon name="chevronDown" size={16} />}
      </IconButton>
    );
  }, []);

  const allColumns = useMemo(
    () => buildAllColumns<E>({ columns, baseColumns, hideState }),
    [columns, baseColumns, hideState]
  );

  const hasActionsColumn = Boolean(
    onView ||
      onEdit ||
      onDelete ||
      onStatusChange ||
      renderRowActionStatus ||
      openEntityModal ||
      rowActions
  );

  const colDefs = useMemo(
    () =>
      mapToAgGridColDefs<E>({
        allColumns,
        activeColumnVisibility,
        translate: t,
        hasExpandRow: Boolean(renderExpandedRow),
        ExpandCellRenderer,
        hasActionsColumn,
        ActionsCellRenderer,
      }),
    [
      allColumns,
      activeColumnVisibility,
      t,
      renderExpandedRow,
      ExpandCellRenderer,
      hasActionsColumn,
      ActionsCellRenderer,
    ]
  );

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
    return resolveExportColumns<E>(allColumns, (key: string) => t(key, key));
  }, [allColumns, t]);

  const collectAllRows = useCallback(async (): Promise<E[]> => {
    if (!fetchData) return rawData;
    const filter: Record<string, string> = {};
    if (activeStatusFilter) filter.status = activeStatusFilter;
    const pageSizeNum = 100;
    const accumulatedItems: E[] = [];
    let page = 1;
    let total = Infinity;
    while (accumulatedItems.length < total && page <= 1000) {
      const res = await fetchData({
        page,
        limit: pageSizeNum,
        search: searchTerm || undefined,
        orderBy: mSortKey || undefined,
        orderDirection: mSortOrder,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
      });
      const normalized = normalizeResponse(res);
      accumulatedItems.push(...normalized.data);
      total = normalized.total;
      if (normalized.data.length < pageSizeNum) break;
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

  const userPreferredPageSize = useMemo(getPreferredItemsPerPage, []);
  const [localPageSize, setLocalPageSize] = useState(pageSize ?? userPreferredPageSize);
  const effectivePageSize = localPageSize;
  const selectorCurrentSize = isManaged ? mLimit : effectivePageSize;

  const effectivePageSizeSelector = useMemo(() => {
    const baseOptions = pageSizeSelector ?? [...PAGE_SIZE_OPTIONS];
    if (!baseOptions.includes(selectorCurrentSize)) {
      return [...baseOptions, selectorCurrentSize].sort((a, b) => a - b);
    }
    return baseOptions;
  }, [pageSizeSelector, selectorCurrentSize]);

  const [localPage, setLocalPage] = useState(0);
  const [localTotal, setLocalTotal] = useState(rawData.length);

  const syncLocalPagination = useCallback(() => {
    if (isManaged) return;
    const api = gridApiRef.current;
    setLocalPage(api?.paginationGetCurrentPage() ?? 0);
    setLocalTotal(api?.getDisplayedRowCount() ?? rawData.length);
  }, [gridApiRef, isManaged, rawData.length]);

  useEffect(() => {
    if (isManaged) return;
    setLocalTotal(rawData.length);
    const lastPage = Math.max(0, Math.ceil(rawData.length / effectivePageSize) - 1);
    if (localPage > lastPage) {
      setLocalPage(lastPage);
      gridApiRef.current?.paginationGoToPage(lastPage);
    }
  }, [effectivePageSize, gridApiRef, isManaged, localPage, rawData.length]);

  useEffect(() => {
    if (isManaged) return;
    setLocalPage(0);
    gridApiRef.current?.paginationGoToFirstPage();
  }, [gridApiRef, isManaged, searchTerm]);

  const handlePaginationPageChange = useCallback(
    (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      if (isManaged) {
        setMPage(newPage);
        return;
      }
      setLocalPage(newPage);
      gridApiRef.current?.paginationGoToPage(newPage);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [gridApiRef, isManaged, setMPage]
  );

  const handlePaginationPageSizeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newSize = Number.parseInt(event.target.value, 10);
      setMLimit(newSize);
      if (!isManaged) {
        setLocalPageSize(newSize);
        setLocalPage(0);
        gridApiRef.current?.setGridOption('paginationPageSize', newSize);
        gridApiRef.current?.paginationGoToFirstPage();
      }
    },
    [gridApiRef, isManaged, setMLimit]
  );

  const paginationCount = isManaged ? mTotalCount : localTotal;
  const paginationPage = isManaged ? mPage : localPage;
  const paginationLimit = isManaged ? mLimit : effectivePageSize;
  const mobileRows = isManaged
    ? rowData
    : rowData.slice(localPage * effectivePageSize, (localPage + 1) * effectivePageSize);

  const onGetRowStyle = useCallback(
    (params: { data?: E | DetailRow<E> }) => {
      if (getRowStyle && params.data && !isDetailRow(params.data)) {
        return getRowStyle(params.data);
      }
      return undefined;
    },
    [getRowStyle]
  );

  return (
    <Box
      className="table-container"
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 110px)',
      }}
    >
      {title && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>{title}</Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {createLabel && (onCreateClick || openEntityModal) && (
            <CreateButton
              variant="primary"
              onClick={
                openEntityModal ? () => openModal(ActionMode.Create, undefined) : onCreateClick
              }
              className="table-create-btn"
            >
              {createLabel}
            </CreateButton>
          )}
        </Box>
      )}

      {!title && subtitle && (
        <Typography variant="body2" sx={{ mb: 3 }}>
          {subtitle}
        </Typography>
      )}

      {error && (
        <Alert severity="error" onClose={onErrorClose} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!hideToolbar && (
        <DataTableToolbar
          onRefresh={onRefresh}
          hideState={hideState}
          activeStatusFilterOptions={activeStatusFilterOptions}
          activeStatusFilter={activeStatusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          onPageReset={() => setMPage(0)}
          toolbarFilters={toolbarFilters}
          extraToolbarActions={extraToolbarActions}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          searchPlaceholder={searchPlaceholder}
          colBtnRef={colBtnRef}
          onOpenColMenu={handleOpenColMenu}
          colMenuAnchor={colMenuAnchor}
          onColMenuClose={() => setColMenuAnchor(null)}
          toggleableCols={toggleableCols}
          onColVisToggle={handleColVisToggle}
          showExport={showExport}
          exporting={exporting}
          exportAnchor={exportAnchor}
          onExportClick={(event) => setExportAnchor(event.currentTarget)}
          onExportClose={() => setExportAnchor(null)}
          onRunExport={runExport}
          isManaged={isManaged}
        />
      )}

      {isSmall && renderCard ? (
        <Box
          className="table-cards-wrapper"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            flex: 1,
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 250px)',
          }}
        >
          {mobileRows.map((row, idx) => {
            if (isDetailRow(row)) return null;
            return <React.Fragment key={idx}>{renderCard(row as E)}</React.Fragment>;
          })}
        </Box>
      ) : (
        <Box
          className={`nagma-grid table-grid-wrapper ${resolvedTheme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine'}`}
          sx={{
            width: '100%',
            flex: 1,
            minHeight: 0,
            position: 'relative',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x pan-y',
            '& > div': { height: '100%', minWidth: { xs: 480, md: 'auto' } },
            bgcolor: (tTheme) =>
              tTheme.palette.mode === 'light'
                ? 'background.paper'
                : alpha(tTheme.palette.common.white, 0.02),
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <AgGridReact
            defaultColDef={DEFAULT_COL_DEF}
            columnDefs={colDefs}
            rowData={rowData}
            loading={isLoading !== undefined ? isLoading : activeFetching}
            onGridReady={onGridReady}
            onRowClicked={
              onRowClick ? (event) => event.data && onRowClick(event.data as E) : undefined
            }
            onSortChanged={isManaged ? handleSortChanged : undefined}
            onColumnVisible={props.onColumnVisibilityChange ? handleColumnVisible : undefined}
            noRowsOverlayComponent={NoRowsOverlay}
            noRowsOverlayComponentParams={{ message: effectiveEmptyMessage }}
            loadingOverlayComponent={LoadingOverlay}
            isFullWidthRow={
              renderExpandedRow
                ? (params: IsFullWidthRowParams) =>
                    !!(params.rowNode.data as DetailRow<E> | undefined)?.__isDetailRow
                : undefined
            }
            fullWidthCellRenderer={renderExpandedRow ? FullWidthDetailCellRenderer : undefined}
            getRowId={(params) => {
              const rowItem = params.data as DetailRow<E> | RowWithId;
              if ('__isDetailRow' in rowItem) {
                return `__detail__${String((rowItem.__parentData as RowWithId)?.id ?? '')}`;
              }
              if (props.keyExtractor) {
                return String(props.keyExtractor(rowItem as E));
              }
              return String((rowItem as RowWithId).id ?? '');
            }}
            quickFilterText={!isManaged ? searchTerm : undefined}
            pagination={!isManaged}
            paginationPageSize={paginationLimit}
            paginationPageSizeSelector={effectivePageSizeSelector}
            suppressPaginationPanel
            onPaginationChanged={syncLocalPagination}
            onModelUpdated={syncLocalPagination}
            suppressCellFocus
            rowStyle={{ cursor: onRowClick ? 'pointer' : 'default' }}
            getRowStyle={onGetRowStyle}
          />
        </Box>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={effectiveDeleteConfirmTitle}
        message={effectiveDeleteConfirmMessage}
        confirmText={t('Elimina')}
        severity="error"
        loading={deleteLoading}
      />

      {modalContent}

      {footerContent}

      <TablePagination
        component="div"
        count={paginationCount}
        page={paginationPage}
        onPageChange={handlePaginationPageChange}
        rowsPerPage={paginationLimit}
        rowsPerPageOptions={effectivePageSizeSelector}
        onRowsPerPageChange={handlePaginationPageSizeChange}
        labelRowsPerPage={t('Righe per pagina:')}
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} di ${count}`}
        getItemAriaLabel={(type) => {
          if (type === 'first') return t('Prima pagina');
          if (type === 'last') return t('Ultima pagina');
          if (type === 'next') return t('Pagina successiva');
          return t('Pagina precedente');
        }}
        className="table-pagination"
        sx={{ mt: footerContent ? 0.5 : 2, flexShrink: 0 }}
      />
    </Box>
  );
};

DataTableComponent.displayName = 'DataTableComponent';

export const DataTable = forwardRef(DataTableComponent) as <E>(
  props: DataTableProps<E> & { ref?: React.Ref<DataTableRef<E>> }
) => React.ReactElement;

export default DataTable;
