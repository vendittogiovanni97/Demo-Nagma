"use client";

import DataTable from '@/common/components/table/DataTable';
import type { TableAction } from '@/common/components/table/TableActions';
import { formatPrice } from '@/common/shared/utils/format';
import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { SpesaLibera } from '../model/spese.types';
import { useCallback } from 'react';

interface SpesaDataTableProps {
  spese: SpesaLibera[];
  isLoading: boolean;
  monthLabel: string;
  total: number;
  onDelete: (id: number) => void;
  pageSize?: number;
}

export default function SpesaDataTable({
  spese,
  isLoading,
  monthLabel,
  total,
  onDelete,
  pageSize,
}: SpesaDataTableProps) {
  const theme = useTheme();

  const rowActions = useCallback((spesa: SpesaLibera): TableAction[] => [
    {
      id: 'delete',
      label: 'Elimina',
      icon: 'trash2',
      tone: 'error',
      onClick: () => onDelete(spesa.id),
    },
  ], [onDelete]);

  const columns = [
    { key: 'name', label: 'Nome', flex: 2, minWidth: 260 },
    {
      key: 'createdAt',
      label: 'Data',
      minWidth: 140,
      flex: 1,
      align: 'center' as const,
      render: (s: SpesaLibera) => format(new Date(s.createdAt), 'd MMMM yyyy', { locale: it })
    },
    {
      key: 'price',
      label: 'Prezzo',
      align: 'center' as const,
      minWidth: 110,
      flex: 0.8,
      render: (s: SpesaLibera) => (
        <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          {formatPrice(s.price)}
        </Typography>
      )
    },
  ];

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <DataTable<SpesaLibera>
        columns={columns}
        data={spese}
        isLoading={isLoading}
        keyExtractor={(s) => s.id}
        emptyTitle={`Nessuna spesa per ${monthLabel}`}
        emptyDescription="Registra la tua prima spesa per questo mese."
        hideState
        rowActions={rowActions}
        pageSize={pageSize}
        footerContent={(
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 3,
              py: 2,
              mt: 2,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1.5,
              backgroundColor: alpha(theme.palette.common.white, 0.03),
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Totale {monthLabel}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.main,
                fontVariant: 'tabular-nums',
              }}
            >
              {formatPrice(total)}
            </Typography>
          </Box>
        )}
      />
    </Box>
  );
}
