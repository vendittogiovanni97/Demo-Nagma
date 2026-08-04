"use client";

import { Box, Typography, useTheme } from '@mui/material';
import { glassSurfaceSx } from '@/common/theme/glassStyles';
import { formatPrice } from '@/common/shared/utils/format';

export interface TableFooterTotalProps {
  total: number;
  label: string;
  color?: 'primary' | 'success' | 'info' | 'warning' | 'error';
}

export default function TableFooterTotal({
  total,
  label,
  color = 'primary',
}: TableFooterTotalProps) {
  const theme = useTheme();
  const textColor = theme.palette[color]?.main || theme.palette.primary.main;

  return (
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
        ...glassSurfaceSx(theme),
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: textColor,
          fontVariant: 'tabular-nums',
        }}
      >
        {formatPrice(total)}
      </Typography>
    </Box>
  );
}
