"use client";

import { useState } from 'react';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { glassSurfaceSx } from '@/common/theme/glassStyles';
import { formatPrice } from '@/common/shared/utils/format';
import Icon from '@/common/components/ui/Icon';

export interface TableFooterTotalProps {
  total: number;
  label: string;
  color?: 'primary' | 'success' | 'info' | 'warning' | 'error';
  privacyToggle?: boolean;
  defaultHidden?: boolean;
}

export default function TableFooterTotal({
  total,
  label,
  color = 'primary',
  privacyToggle = true,
  defaultHidden = true,
}: TableFooterTotalProps) {
  const theme = useTheme();
  const [isHidden, setIsHidden] = useState(defaultHidden);

  const textColor = theme.palette[color]?.main || theme.palette.primary.main;

  return (
    <Box
      sx={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        px: 3,
        py: 2,
        mt: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: 2.5,
        ...glassSurfaceSx(theme),
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {label}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            color: textColor,
            fontVariant: 'tabular-nums',
            letterSpacing: isHidden ? '0.15em' : 0,
          }}
        >
          {isHidden ? '€ ••••••' : formatPrice(total)}
        </Typography>

        {privacyToggle && (
          <IconButton
            size="small"
            onClick={() => setIsHidden((prev) => !prev)}
            aria-label={isHidden ? 'Mostra totale' : 'Nascondi totale'}
            sx={{
              color: 'text.secondary',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${theme.palette.divider}`,
              p: 0.75,
              transition: 'all 0.2s ease',
              '&:hover': {
                color: 'primary.main',
                bgcolor: 'rgba(0, 191, 255, 0.1)',
                transform: 'scale(1.05)',
              },
            }}
          >
            <Icon name={isHidden ? 'eyeOff' : 'eye'} size={18} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
