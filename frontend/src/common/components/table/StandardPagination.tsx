'use client';

import React from 'react';
import Box from '@mui/material/Box';
import TablePagination from '@mui/material/TablePagination';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export interface StandardPaginationProps {
  total: number;
  page: number;
  limit: number;
  onPageChange: (newPage: number) => void;
  onLimitChange?: (newLimit: number) => void;
  rowsPerPageOptions?: number[];
  showRangeLabel?: boolean;
}

export function StandardPagination({
  total,
  page,
  limit,
  onPageChange,
  onLimitChange,
  rowsPerPageOptions = [10, 25, 50, 100],
  showRangeLabel = true,
}: StandardPaginationProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(total, page * limit);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        py: 1.5,
        px: 2,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Range Text */}
      {showRangeLabel && (
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
          {total === 0
            ? 'Nessun elemento presente'
            : `Mostrati ${startItem}-${endItem} di ${total}`}
        </Typography>
      )}

      {/* Pagination Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        {onLimitChange && !isMobile && (
          <TablePagination
            component="div"
            count={total}
            page={Math.max(0, page - 1)}
            onPageChange={(_, newPage) => onPageChange(newPage + 1)}
            rowsPerPage={limit}
            onRowsPerPageChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
            rowsPerPageOptions={rowsPerPageOptions}
            labelRowsPerPage="Elementi per pagina:"
            sx={{ borderBottom: 'none', '.MuiTablePagination-toolbar': { minHeight: 40, p: 0 } }}
          />
        )}

        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, newPage) => {
            onPageChange(newPage);
          }}
          color="primary"
          shape="rounded"
          size={isMobile ? 'small' : 'medium'}
        />
      </Box>
    </Box>
  );
}
