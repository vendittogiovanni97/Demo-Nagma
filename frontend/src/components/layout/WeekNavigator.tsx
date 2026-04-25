"use client";

import { addDays, format } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Box, Stack, Typography, IconButton, useTheme } from '@mui/material';

type FormatStyle = 'short' | 'full';
type Variant = 'header' | 'minimal';

interface WeekNavigatorProps {
  weekStart: string | Date;
  onPrev: () => void;
  onNext: () => void;
  format?: FormatStyle;
  variant?: Variant;
  className?: string;
}

export default function WeekNavigator({
  weekStart,
  onPrev,
  onNext,
  format: formatStyle = 'full',
  variant = 'minimal',
  className,
}: WeekNavigatorProps) {
  const theme = useTheme();
  const date = typeof weekStart === 'string' ? new Date(weekStart) : weekStart;
  const endDate = addDays(date, 6);

  const displayText = formatStyle === 'short'
    ? `${format(date, 'dd MMM', { locale: it })} — ${format(endDate, 'dd MMM', { locale: it })}`
    : `${format(date, 'dd MMM', { locale: it })} — ${format(endDate, 'dd MMM yyyy', { locale: it })}`;

  const variantConfig = {
    minimal: {
      height: '48px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      border: `1px solid ${theme.palette.divider}`,
      padding: '4px',
      borderRadius: '8px',
    },
    header: {
      height: '48px',
      backgroundColor: 'rgba(26, 35, 50, 0.5)',
      border: `1px solid ${theme.palette.divider}`,
      padding: '8px 16px',
      borderRadius: '12px',
      backdropFilter: 'blur(8px)',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    },
  };

  const textConfig = {
    minimal: {
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: theme.palette.primary.main,
      minWidth: '128px',
      textAlign: 'center',
    },
    header: {
      fontSize: '16px',
      fontWeight: 700,
      color: theme.palette.text.primary,
      minWidth: '200px',
      textAlign: 'center',
      letterSpacing: '0.02em',
    },
  };

  const iconSize = variant === 'minimal' ? 16 : 20;

  return (
    <Stack
      direction="row"
      className={className}
      sx={{
        alignItems: 'center',
        ...variantConfig[variant],
        transition: 'all 0.3s ease',
      }}
    >
      <IconButton
        size="small"
        onClick={onPrev}
        title="Settimana precedente"
        sx={{
          color: theme.palette.text.primary,
          transition: 'all 0.3s ease',
          '&:hover': {
            color: theme.palette.primary.main,
            backgroundColor: `rgba(0, 191, 255, 0.08)`,
          },
          padding: '8px',
        }}
      >
        <ChevronLeft size={iconSize} />
      </IconButton>

      <Typography
        sx={{
          ...textConfig[variant],
          flex: 1,
          padding: '0 12px',
        }}
      >
        {displayText}
      </Typography>

      <IconButton
        size="small"
        onClick={onNext}
        title="Settimana successiva"
        sx={{
          color: theme.palette.text.primary,
          transition: 'all 0.3s ease',
          '&:hover': {
            color: theme.palette.primary.main,
            backgroundColor: `rgba(0, 191, 255, 0.08)`,
          },
          padding: '8px',
        }}
      >
        <ChevronRight size={iconSize} />
      </IconButton>
    </Stack>
  );
}
