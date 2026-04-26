'use client';

import { useMemo } from 'react';
import { Box, useTheme } from '@mui/material';
import type { Column } from '@/components/data-display/DataTable';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { CreamSale } from '@/services/cream.service';

export function useCreamColumns(): Column<CreamSale>[] {
  const theme = useTheme();

  return useMemo(() => [
    {
      key: 'soldAt',
      label: 'Data',
      width: '140px',
      render: (row) => (
        <Box sx={{ fontSize: '0.875rem', color: theme.palette.text.primary }}>
          {format(new Date(row.soldAt), 'dd MMM yyyy', { locale: it })}
        </Box>
      ),
    },
    {
      key: 'artist',
      label: 'Artista',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: row.artist.color || theme.palette.primary.main,
              flexShrink: 0,
              boxShadow: `0 0 0 1px ${theme.palette.text.disabled}`,
            }}
          />
          <Box sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>
            {row.artist.name}
          </Box>
        </Box>
      ),
    },
    {
      key: 'quantity',
      label: 'Qtà',
      width: '80px',
      align: 'center',
      render: (row) => (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 1.5,
            bgcolor: `${theme.palette.primary.main}26`,
            color: theme.palette.primary.main,
            fontWeight: 700,
            fontSize: '0.875rem',
          }}
        >
          {row.quantity}
        </Box>
      ),
    },
  ], [theme]);
}