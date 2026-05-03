'use client';

import { useMemo } from 'react';
import { CalendarDays, User } from 'lucide-react';
import { Stack, Typography, useTheme, Chip, Box } from '@mui/material';
import type { Column } from '@/components/data-display/DataTable';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { BookingAction, BookingHistoryEntry } from '@/modules/booking-history/api/booking-history.api';
import type { SxProps, Theme } from '@mui/material';

type ActionConfig = Record<
  BookingAction,
  { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'; sx?: SxProps<Theme> }
>;

const ACTION_CONFIG: ActionConfig = {
  CREATO: {
    label: 'Creata',
    color: 'info',
    sx: { backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' },
  },
  CONFERMATO: {
    label: 'Confermata',
    color: 'success',
    sx: { backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' },
  },
  MODIFICATO: {
    label: 'Modificata',
    color: 'warning',
    sx: { backgroundColor: 'rgba(217, 119, 6, 0.2)', color: '#d97706' },
  },
  SPOSTATO: {
    label: 'Spostata',
    color: 'secondary',
    sx: { backgroundColor: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' },
  },
  ANNULLATO: {
    label: 'Annullata',
    color: 'error',
    sx: { backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' },
  },
  COMPLETATO: {
    label: 'Completata',
    color: 'success',
    sx: { backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' },
  },
  CANCELLATO: {
    label: 'Eliminata',
    color: 'error',
    sx: { backgroundColor: 'rgba(156, 163, 175, 0.2)', color: '#9ca3af' },
  },
};

export function useBookingHistoryColumns(): Column<BookingHistoryEntry>[] {
  const theme = useTheme();

  return useMemo(() => [
    {
      key: 'changedAt',
      label: 'Data',
      width: '150px',
      render: (entry) => (
        <Stack direction="row" useFlexGap sx={{ fontSize: '0.875rem', alignItems: 'center', gap: 0.75 }}>
          <CalendarDays size={14} style={{ color: theme.palette.primary.main, flexShrink: 0 }} />
          {format(new Date(entry.changedAt), 'dd MMM yyyy', { locale: it })}
        </Stack>
      ),
    },
    {
      key: 'action',
      label: 'Azione',
      width: '120px',
      render: (entry) => {
        const cfg = ACTION_CONFIG[entry.action];
        return (
          <Chip
            label={ACTION_CONFIG[entry.action]?.label ?? entry.action}
            size="small"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              ...cfg?.sx,
            }}
          />
        );
      },
    },
    {
      key: 'cliente',
      label: 'Cliente',
      render: (entry) =>
        entry.booking?.customer ? (
          <Stack direction="column" useFlexGap sx={{ gap: 0.5 }}>
            <Typography
              sx={{
                color: theme.palette.text.primary,
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              {entry.booking.customer.firstName} {entry.booking.customer.lastName}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: theme.palette.text.secondary,
                fontFamily: 'monospace',
              }}
            >
              {entry.booking.customer.phone}
            </Typography>
          </Stack>
        ) : (
          <Typography sx={{ opacity: 0.4 }}>—</Typography>
        ),
    },
    {
      key: 'artista',
      label: 'Artista',
      width: '140px',
      render: (entry) =>
        entry.booking?.artist ? (
          <Stack direction="row" useFlexGap sx={{ gap: 1, alignItems: 'center', fontSize: '0.875rem' }}>
            <Box
              sx={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                flexShrink: 0,
                border: `1px solid rgba(255, 255, 255, 0.1)`,
                backgroundColor: entry.booking.artist.color,
              }}
            />
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
              {entry.booking.artist.name}
            </Typography>
          </Stack>
        ) : (
          <Typography sx={{ opacity: 0.4, fontSize: '0.875rem' }}>—</Typography>
        ),
    },
    {
      key: 'data',
      label: 'Dettagli',
      render: (entry) => {
        const actionType = entry.action;
        if (entry.oldDate || entry.newDate) {
          return (
            <Stack direction="row" useFlexGap sx={{ gap: 1, fontSize: '0.875rem' }}>
              {entry.oldDate && (
                <Typography sx={{ color: '#ef4444', textDecoration: 'line-through', fontSize: '0.875rem' }}>
                  {format(new Date(entry.oldDate), 'dd/MM/yyyy HH:mm', { locale: it })}
                </Typography>
              )}
              {entry.newDate && (
                <Typography sx={{ color: '#10b981', fontSize: '0.875rem' }}>
                  {format(new Date(entry.newDate), 'dd/MM/yyyy HH:mm', { locale: it })}
                </Typography>
              )}
            </Stack>
          );
        }
        if (actionType === 'CREATO') return <Typography sx={{ color: '#3b82f6', fontSize: '0.875rem' }}>Nuova prenotazione</Typography>;
        if (actionType === 'ANNULLATO') return <Typography sx={{ color: '#ef4444', fontSize: '0.875rem' }}>Prenotazione annullata</Typography>;
        if (actionType === 'COMPLETATO') return <Typography sx={{ color: '#10b981', fontSize: '0.875rem' }}>Prenotazione completata</Typography>;
        return <Typography sx={{ fontSize: '0.875rem' }}>—</Typography>;
      },
    },
    {
      key: 'changedBy',
      label: 'Utente',
      width: '150px',
      render: (entry) => (
        <Stack direction="row" useFlexGap sx={{ gap: 0.75, alignItems: 'center', fontSize: '0.875rem' }}>
          <User size={12} style={{ color: theme.palette.primary.main, flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {entry.changedBy?.name || '—'}
          </Typography>
        </Stack>
      ),
    },
  ], [theme]);
}