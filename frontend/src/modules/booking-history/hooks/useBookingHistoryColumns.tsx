'use client';

import { useMemo } from 'react';
import Icon from '@/common/components/ui/Icon';
import { Stack, Typography, useTheme, Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import Badge from '@/common/components/ui/Badge';
import type { ColumnDefinition as Column } from '@/common/components/table/DataTable';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { BookingHistoryEntry } from '@/modules/booking-history/api/booking-history.api';
import { getBookingStatusBadgeVariant, getBookingStatusLabel } from '@/common/config/status-config';
import BookingHistoryDateDetails from '@/modules/booking-history/components/BookingHistoryDateDetails';

export function useBookingHistoryColumns(): Column<BookingHistoryEntry>[] {
  const theme = useTheme();

  return useMemo(() => [
    {
      key: 'changedAt',
      label: 'Registrato il',
      minWidth: 170,
      flex: 1.15,
      render: (entry) => (
        <Stack direction="row" useFlexGap sx={{ fontSize: '0.875rem', alignItems: 'center', gap: 0.75 }}>
          <Icon name="calendarDays" size={14} color={theme.palette.primary.main} />
          {format(new Date(entry.changedAt), 'dd MMM yyyy HH:mm', { locale: it })}
        </Stack>
      ),
    },
    {
      key: 'action',
      label: 'Stato',
      minWidth: 115,
      flex: 0.8,
      render: (entry) => (
        <Badge
          label={getBookingStatusLabel(entry.action)}
          variant={getBookingStatusBadgeVariant(entry.action)}
          size="sm"
        />
      ),
    },
    {
      key: 'cliente',
      label: 'Cliente',
      minWidth: 170,
      flex: 1.25,
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
      minWidth: 135,
      flex: 1,
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
      label: 'Data appuntamento',
      minWidth: 190,
      flex: 1.5,
      render: (entry) => <BookingHistoryDateDetails entry={entry} />,
    },
    {
      key: 'changedBy',
      label: 'Utente',
      minWidth: 140,
      flex: 1,
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
