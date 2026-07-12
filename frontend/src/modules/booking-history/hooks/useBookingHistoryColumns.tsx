'use client';

import { useMemo } from 'react';
import Icon from '@/common/components/ui/Icon';
import { Stack, Typography, useTheme, Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import Badge from '@/common/components/ui/Badge';
import type { Column } from '@/common/components/data-display/DataTable';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { BookingAction, BookingHistoryEntry } from '@/modules/booking-history/api/booking-history.api';
import type { SxProps, Theme } from '@mui/material';

function createActionConfig(theme: any): ActionConfig {
  return {
    CREATO: {
      label: 'Creata',
      color: 'info',
      sx: { backgroundColor: alpha(theme.palette.info.main, 0.2), color: theme.palette.info.main },
    },
    CONFERMATO: {
      label: 'Confermata',
      color: 'success',
      sx: { backgroundColor: alpha(theme.palette.success.main, 0.2), color: theme.palette.success.main },
    },
    MODIFICATO: {
      label: 'Modificata',
      color: 'warning',
      sx: { backgroundColor: alpha(theme.palette.warning.main, 0.2), color: theme.palette.warning.main },
    },
    SPOSTATO: {
      label: 'Spostata',
      color: 'secondary',
      sx: { backgroundColor: alpha(theme.palette.custom.purple, 0.2), color: theme.palette.custom.purple },
    },
    ANNULLATO: {
      label: 'Annullata',
      color: 'error',
      sx: { backgroundColor: alpha(theme.palette.error.main, 0.2), color: theme.palette.error.main },
    },
    COMPLETATO: {
      label: 'Completata',
      color: 'success',
      sx: { backgroundColor: alpha(theme.palette.success.main, 0.2), color: theme.palette.success.main },
    },
    CANCELLATO: {
      label: 'Eliminata',
      color: 'error',
      sx: { backgroundColor: alpha(theme.palette.text.secondary, 0.2), color: theme.palette.text.secondary },
    },
  };
}

type ActionConfig = Record<
  BookingAction,
  { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'; sx?: SxProps<Theme> }
>;

export function useBookingHistoryColumns(): Column<BookingHistoryEntry>[] {
  const theme = useTheme();
  const ACTION_CONFIG = useMemo(() => createActionConfig(theme), [theme]);

  return useMemo(() => [
    {
      key: 'changedAt',
      label: 'Data',
      width: '180px',
      render: (entry) => (
        <Stack direction="row" useFlexGap sx={{ fontSize: '0.875rem', alignItems: 'center', gap: 0.75 }}>
          <Icon name="calendarDays" size={14} color={theme.palette.primary.main} />
          {format(new Date(entry.changedAt), 'dd MMM yyyy HH:mm', { locale: it })}
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
          <Badge
            label={ACTION_CONFIG[entry.action]?.label ?? entry.action}
            size="sm"
            variant={cfg?.color as any}
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
                border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
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
                <Typography sx={{ color: theme.palette.error.main, textDecoration: 'line-through', fontSize: '0.875rem' }}>
                  {format(new Date(entry.oldDate), 'dd/MM/yyyy HH:mm', { locale: it })}
                </Typography>
              )}
              {entry.newDate && (
                <Typography sx={{ color: theme.palette.success.main, fontSize: '0.875rem' }}>
                  {format(new Date(entry.newDate), 'dd/MM/yyyy HH:mm', { locale: it })}
                </Typography>
              )}
            </Stack>
          );
        }
        if (actionType === 'CREATO') return <Typography sx={{ color: theme.palette.info.main, fontSize: '0.875rem' }}>Nuova prenotazione</Typography>;
        if (actionType === 'ANNULLATO') return <Typography sx={{ color: theme.palette.error.main, fontSize: '0.875rem' }}>Prenotazione annullata</Typography>;
        if (actionType === 'COMPLETATO') return <Typography sx={{ color: theme.palette.success.main, fontSize: '0.875rem' }}>Prenotazione completata</Typography>;
        return <Typography sx={{ fontSize: '0.875rem' }}>—</Typography>;
      },
    },
    {
      key: 'changedBy',
      label: 'Utente',
      width: '150px',
      render: (entry) => (
        <Stack direction="row" useFlexGap sx={{ gap: 0.75, alignItems: 'center', fontSize: '0.875rem' }}>
          <Icon name="user" size={12} color={theme.palette.primary.main} />
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {entry.changedBy?.name || '—'}
          </Typography>
        </Stack>
      ),
    },
  ], [theme]);
}