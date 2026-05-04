"use client";

import DataTable, { type Column } from '@/components/data-display/DataTable';
import StatePanel from '@/components/feedback/StatePanel';
import { useTheme as useThemeContext } from '@/context/ThemeContext';
import { Box, CircularProgress, Stack, useTheme as useMuiTheme } from '@mui/material';
import type { RowStyle } from 'ag-grid-community';
import { ReactNode } from 'react';

interface SmartTableProps<T> {
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
  /** Custom empty state */
  emptyTitle?: string;
  emptyDescription?: string;
  /** Custom error state */
  errorTitle?: string;
  errorDescription?: string;
  /** Pagination */
  pageSize?: number;
  onRowClick?: (item: T) => void;
}

export default function SmartTable<T extends object>({
  columns,
  data,
  isLoading = false,
  hasError = false,
  keyExtractor,
  renderCard,
  actions,
  getRowStyle,
  emptyTitle = 'Nessun dato trovato',
  emptyDescription = 'Prova a cambiare i filtri o la ricerca.',
  errorTitle = 'Errore di caricamento',
  errorDescription = 'Si è verificato un problema durante il recupero dei dati.',
  pageSize = 10,
  onRowClick,
}: SmartTableProps<T>) {
  const { isSmall, isMedium } = useThemeContext();
  const theme = useMuiTheme();

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
          title={emptyTitle}
          description={emptyDescription}
        />
      </Box>
    );
  }

  // 4. Responsive Layouts
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

  return (
    <Box sx={{ flex: 1, minHeight: 400 }}>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        actions={actions}
        keyExtractor={keyExtractor}
        getRowStyle={getRowStyle}
        onRowClick={onRowClick}
        pageSize={pageSize}
        emptyMessage={emptyTitle}
      />
    </Box>
  );
}
