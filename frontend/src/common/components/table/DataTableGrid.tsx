'use client';

import type { ColDef, GridApi, RowStyle, SortChangedEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useThemeMode } from '@/common/providers/ThemeModeProvider';

import type { RowWithId } from './DataTable.types';
import { DEFAULT_COL_DEF } from './TableColumns';

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

function NoRowsOverlay({ message }: { message?: string }) {
  const { t } = useTranslation();
  return (
    <Box className="ag-custom-no-rows" sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="body2" color="text.secondary">
        {message || t('Nessun dato disponibile')}
      </Typography>
    </Box>
  );
}

interface DataTableGridProps<E> {
  columns: ColDef[];
  rows: E[];
  loading: boolean;
  remote: boolean;
  search: string;
  pageSize: number;
  pageSizeOptions: number[];
  emptyMessage: string;
  keyExtractor?: (row: E) => string | number;
  onReady: (api: GridApi) => void;
  onSortChanged?: (event: SortChangedEvent) => void;
  onPaginationChanged: () => void;
  getRowStyle?: (params: { data?: E }) => RowStyle | undefined;
}

export function DataTableGrid<E>({
  columns,
  rows,
  loading,
  remote,
  search,
  pageSize,
  pageSizeOptions,
  emptyMessage,
  keyExtractor,
  onReady,
  onSortChanged,
  onPaginationChanged,
  getRowStyle,
}: DataTableGridProps<E>) {
  const { resolvedTheme } = useThemeMode();

  return (
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
        bgcolor: (theme) =>
          theme.palette.mode === 'light'
            ? 'background.paper'
            : alpha(theme.palette.common.white, 0.02),
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <AgGridReact
        defaultColDef={DEFAULT_COL_DEF}
        columnDefs={columns}
        rowData={rows}
        loading={loading}
        onGridReady={(event) => onReady(event.api)}
        onSortChanged={onSortChanged}
        noRowsOverlayComponent={NoRowsOverlay}
        noRowsOverlayComponentParams={{ message: emptyMessage }}
        loadingOverlayComponent={LoadingOverlay}
        getRowId={(params) => {
          const row = params.data as E & RowWithId;
          return String(keyExtractor ? keyExtractor(row) : (row.id ?? ''));
        }}
        quickFilterText={remote ? undefined : search}
        pagination={!remote}
        paginationPageSize={pageSize}
        paginationPageSizeSelector={pageSizeOptions}
        suppressPaginationPanel
        onPaginationChanged={onPaginationChanged}
        onModelUpdated={onPaginationChanged}
        suppressCellFocus
        getRowStyle={getRowStyle}
      />
    </Box>
  );
}
