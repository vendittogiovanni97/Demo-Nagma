"use client";

import { useState } from 'react';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
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
  const isLight = theme.palette.mode === 'light';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: 3,
        py: 1.5,
        mt: 1.5,
        mb: 1,
        borderRadius: 2.5,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        bgcolor: isLight
          ? 'rgba(255, 255, 255, 0.95)'
          : alpha(theme.palette.background.paper, 0.75),
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.25)}`,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: 800,
          color: theme.palette.text.secondary,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontSize: '0.8125rem',
        }}
      >
        {label}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            color: textColor,
            fontVariant: 'tabular-nums',
            fontSize: '1.15rem',
            lineHeight: 1,
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
              color: isHidden ? 'text.secondary' : 'primary.main',
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              p: 0.75,
              transition: 'all 0.2s ease',
              '&:hover': {
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.18),
                transform: 'scale(1.08)',
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
