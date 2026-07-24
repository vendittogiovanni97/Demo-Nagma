"use client";

import type { ColumnDefinition as Column } from '@/common/components/table/DataTable';
import type { ExportFilter } from '@/common/components/modals/ExportModal';
import type { Booking } from '@/modules/booking/model/booking.types';
import { Badge as MuiBadge, Box, Stack, Typography } from '@mui/material';
import Badge from '@/common/components/ui/Badge';
import { useTheme, alpha } from '@mui/material/styles';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import Icon from '@/common/components/ui/Icon';
import { useMemo } from 'react';
import { BOOKING_STATUS_CONFIG, getBookingStatusLabel, getBookingStatusBadgeVariant } from '@/common/config/status-config';

interface UseBookingColumnsOptions {
  onAttachmentClick?: (booking: Booking) => void;
}

export function useBookingColumns(options: UseBookingColumnsOptions = {}) {
  const theme = useTheme();
  const { onAttachmentClick } = options;

  const staticColumns: Column<Booking>[] = [
    {
      key: 'cliente',
      label: 'Cliente',
      minWidth: 170,
      flex: 1.45,
      sortValue: (booking) =>
        booking.customer
          ? `${booking.customer.lastName ?? ''} ${booking.customer.firstName ?? ''}`.trim().toLowerCase()
          : '',
      render: (booking) => (
        booking.customer ? (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {booking.customer.firstName} {booking.customer.lastName}
            </Typography>
            {booking.customer.phone && (
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  display: 'block',
                  mt: 0.25,
                  fontFamily: 'monospace',
                }}
              >
                {booking.customer.phone}
              </Typography>
            )}
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: theme.palette.text.disabled }}>
            —
          </Typography>
        )
      ),
    },
    {
      key: 'artista',
      label: 'Artista',
      minWidth: 140,
      flex: 1.2,
      sortValue: (booking) => booking.artist?.name?.toLowerCase() ?? '',
      render: (booking) => (
        <Stack direction="row" useFlexGap sx={{ gap: 1, alignItems: 'center' }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: booking.artist?.color ?? theme.palette.action.disabled,
              flexShrink: 0,
            }}
          />
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, whiteSpace: 'nowrap' }}>
            {booking.artist?.name ?? '—'}
          </Typography>
        </Stack>
      ),
    },
    {
      key: 'data_ora',
      label: 'Data appuntamento',
      minWidth: 135,
      flex: 1.15,
      sortValue: (booking) => new Date(booking.date).getTime(),
      render: (booking) => (
        <Stack useFlexGap sx={{ gap: 0.25 }}>
          <Stack direction="row" useFlexGap sx={{ gap: 0.75, alignItems: 'center' }}>
            <Icon name="clock" size={13} color={theme.palette.primary.main} />
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.primary,
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {format(new Date(booking.date), 'dd MMM yyyy', { locale: it })}
            </Typography>
          </Stack>
          <Stack direction="row" useFlexGap sx={{ gap: 0.75, alignItems: 'center' }}>
            <Icon name="clock" size={11} />
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {format(new Date(booking.date), 'HH:mm')}
            </Typography>
          </Stack>
        </Stack>
      ),
    },
    {
      key: 'durata',
      label: 'Durata',
      align: 'center',
      minWidth: 95,
      flex: 0.8,
      sortValue: (booking) => booking.duration,
      render: (booking) => (
        <Stack direction="row" useFlexGap sx={{ gap: 0.75, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <Icon name="timer" size={12} color={theme.palette.primary.main} />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.secondary,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {booking.duration} min
          </Typography>
        </Stack>
      ),
    },
    {
      key: 'prenotato_il',
      label: 'Registrato il',
      minWidth: 125,
      flex: 1,
      sortValue: (booking) => new Date(booking.createdAt).getTime(),
      render: (booking) => (
        <Stack useFlexGap sx={{ gap: 0.25 }}>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 500,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {format(new Date(booking.createdAt), 'dd MMM yyyy', { locale: it })}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {format(new Date(booking.createdAt), 'HH:mm')}
          </Typography>
        </Stack>
      ),
    },
    {
      key: 'stato',
      label: 'Stato',
      align: 'center',
      minWidth: 140,
      flex: 1.1,
      sortValue: (booking) => booking.status,
      render: (booking) => (
        <Badge
          label={getBookingStatusLabel(booking.status)}
          variant={getBookingStatusBadgeVariant(booking.status)}
          size="sm"
        />
      ),
    },
    {
      key: 'prezzo',
      label: 'Prezzo',
      align: 'right',
      minWidth: 105,
      flex: 0.9,
      sortValue: (booking) => booking.price ?? null,
      render: (booking) => (
        <Box sx={{ textAlign: 'right', width: '100%' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {booking.price != null ? `€ ${booking.price.toFixed(2)}` : '—'}
          </Typography>
          {booking.deposit != null && (
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                display: 'block',
                mt: 0.25,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              acc. € {booking.deposit.toFixed(2)}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: 'saldo',
      label: 'Saldo',
      align: 'right',
      minWidth: 105,
      flex: 0.9,
      sortValue: (booking) =>
        booking.price != null ? booking.price - (booking.deposit ?? 0) : null,
      render: (booking) => {
        if (booking.status === 'COMPLETATO') {
          return (
            <Box sx={{ textAlign: 'right', width: '100%' }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.success.main,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                € 0.00
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.success.main,
                  fontWeight: 600,
                  display: 'block',
                  mt: 0.25,
                }}
              >
                Fine
              </Typography>
            </Box>
          );
        }

        if (booking.status === 'ANNULLATO') {
          return (
            <Box sx={{ textAlign: 'right', width: '100%' }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.secondary,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                € 0.00
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  display: 'block',
                  mt: 0.25,
                }}
              >
                —
              </Typography>
            </Box>
          );
        }

        if (booking.price == null) {
          return (
            <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
              —
            </Typography>
          );
        }

        const remaining = booking.price - (booking.deposit ?? 0);
        return (
          <Box sx={{ textAlign: 'right', width: '100%' }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: remaining <= 0 ? theme.palette.success.main : theme.palette.warning.main,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              € {remaining.toFixed(2)}
            </Typography>
            {remaining <= 0 && (
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.success.main,
                  fontWeight: 600,
                  display: 'block',
                  mt: 0.25,
                }}
              >
                Saldato
              </Typography>
            )}
          </Box>
        );
      },
    },

    {
      key: 'allegati',
      label: 'Allegati',
      align: 'center',
      minWidth: 90,
      flex: 0.7,
      sortValue: (booking) => booking.attachments?.length ?? 0,
      render: (booking) => {
        const count = booking.attachments?.length ?? 0;
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <MuiBadge
              badgeContent={count}
              color="primary"
              overlap="circular"
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.background.default,
                  fontWeight: 600,
                  fontSize: '0.65rem',
                },
              }}
            >
              <Box
                role="button"
                tabIndex={0}
                aria-label={`Allegati prenotazione (${count})`}
                onClick={() => onAttachmentClick?.(booking)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onAttachmentClick?.(booking);
                  }
                }}
                sx={{
                  minWidth: 44,
                  minHeight: 44,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  },
                  '&:focus-visible': {
                    outline: `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: 2,
                  },
                }}
              >
                <Icon name="paperclip" size={16} color={theme.palette.primary.main} />
              </Box>
            </MuiBadge>
          </Box>
        );
      },
    },
  ];

  const bookingColumns = useMemo(() => staticColumns, [staticColumns]);


  const exportColumns = useMemo(() => [
    { label: 'Cliente', value: (b: Booking) => b.customer ? `${b.customer.firstName} ${b.customer.lastName}` : '-' },
    { label: 'Artista', value: (b: Booking) => b.artist?.name ?? '-' },
    { label: 'Data', value: (b: Booking) => format(new Date(b.date), 'dd/MM/yyyy HH:mm', { locale: it }) },
    { label: 'Durata (min)', value: (b: Booking) => b.duration },
    { label: 'Stato', value: (b: Booking) => getBookingStatusLabel(b.status) },
    { label: 'Prezzo (€)', value: (b: Booking) => b.price ?? '' },
    { label: 'Acconto (€)', value: (b: Booking) => b.deposit ?? '' },
    { label: 'Note', value: (b: Booking) => b.notes ?? '' },
  ], []);

  const exportFilters: ExportFilter<Booking>[] = useMemo(() => [
    {
      key: 'cliente',
      label: 'Cliente',
      type: 'text',
      placeholder: 'Cerca per nome...',
      filterFn: (b, v) => {
        const name = `${b.customer?.firstName ?? ''} ${b.customer?.lastName ?? ''}`.toLowerCase();
        return name.includes(v.toLowerCase());
      },
    },
    {
      key: 'artista',
      label: 'Artista',
      type: 'text',
      placeholder: 'Cerca per artista...',
      filterFn: (b, v) => {
        if (!v) return true;
        return b.artist?.name?.toLowerCase().includes(v.toLowerCase()) ?? false;
      },
    },
    {
      key: 'stato',
      label: 'Stato',
      type: 'select',
      options: [
        { value: '', label: 'Tutti gli stati' },
        { value: 'CREATO', label: 'Creato' },
        { value: 'CONFERMATO', label: 'Confermato' },
        { value: 'COMPLETATO', label: 'Completato' },
        { value: 'MODIFICATO', label: 'Modificato' },
        { value: 'ANNULLATO', label: 'Annullato' },
        { value: 'SPOSTATO', label: 'Spostato' },
        { value: 'CANCELLATO', label: 'Cancellato' },
      ],
      filterFn: (b, v) => !v || b.status === v,
    },
    {
      key: 'giorno',
      label: 'Giorno',
      type: 'date',
      filterFn: (b, v) => {
        if (!v) return true;
        const bookingDate = format(new Date(b.date), 'yyyy-MM-dd');
        return bookingDate === v;
      },
    },
    {
      key: 'mese',
      label: 'Mese',
      type: 'month',
      filterFn: (b, v) => {
        if (!v) return true;
        const bookingMonth = format(new Date(b.date), 'yyyy-MM');
        return bookingMonth === v;
      },
    },
  ], []);

  return { bookingColumns, exportColumns, exportFilters, BOOKING_STATUS_CONFIG };
}
