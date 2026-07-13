'use client';
import React from 'react';
import Box from '@mui/material/Box';
import { useTheme, alpha } from '@mui/material/styles';

export interface StatusChipProps {
  status: string;
  activeValue?: string;
}

type Tone = 'success' | 'danger' | 'warning' | 'neutral' | 'info';

const STATUS_TONE: Record<string, Tone> = {
  ATTIVO: 'success',
  INVIATO: 'success',
  DISATTIVO: 'neutral',
  ARCHIVIATO: 'neutral',
  BOZZA: 'warning',
  SCADUTO: 'danger',
  ERRORE: 'danger',
};

export const StatusChip = ({ status, activeValue = 'ATTIVO' }: StatusChipProps) => {
  const theme = useTheme();
  const tone: Tone = STATUS_TONE[status] ?? (status === activeValue ? 'success' : 'neutral');

  const toneColor: Record<Tone, string> = {
    success: theme.palette.success.main,
    danger: theme.palette.error.main,
    warning: theme.palette.warning.main,
    info: theme.palette.primary.main,
    neutral: theme.palette.text.disabled,
  };
  const color = toneColor[tone];

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: 0.2,
        color: 'text.primary',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      <Box
        component="span"
        sx={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          backgroundColor: color,
          flexShrink: 0,
          boxShadow: `0 0 0 3px ${alpha(color, 0.16)}`,
        }}
      />
      {status}
    </Box>
  );
};

export default StatusChip;
