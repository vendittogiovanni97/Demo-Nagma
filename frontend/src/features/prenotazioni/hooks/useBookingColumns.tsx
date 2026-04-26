"use client";

import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Chip, Stack, Typography, Badge } from '@mui/material';
import { Clock, Phone, Timer, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import Avatar from '@/components/data-display/Avatar';
import type { Column } from '@/components/data-display/DataTable';
import type { ExportFilter } from '@/components/modals/ExportModal';
import type { Booking, BookingStatus } from '@/types/booking';

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: 'primary' | 'success' | 'error' | 'warning' }> = {
  CONFIRMED: { label: 'Confermato', color: 'primary' },
  COMPLETED: { label: 'Completato', color: 'success' },
  CANCELLED: { label: 'Annullato', color: 'error' },
  RESCHEDULED: { label: 'Spostato', color: 'warning' },
};

export function useBookingColumns() {
  const theme = useTheme();

  const bookingColumns: Column<Booking>[] = useMemo(() => [
    {
      key: 'cliente',
      label: 'Cliente',
      width: '250px',
      render: (booking) => (
        booking.customer ? (
          <Stack direction="row" useFlexGap sx={{ gap: 1, alignItems: 'center' }}>
            <Avatar
              firstName={booking.customer.firstName}
              lastName={booking.customer.lastName}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
          </Stack>
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
      width: '180px',
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
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            {booking.artist?.name ?? '—'}
          </Typography>
        </Stack>
      ),
    },
    {
      key: 'telefono',
      label: 'Telefono',
      width: '150px',
      render: (booking) => (
        <Stack direction="row" useFlexGap sx={{ gap: 0.75, alignItems: 'center' }}>
          {booking.customer?.phone ? (
            <>
              <Phone size={12} color={theme.palette.primary.main} />
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'monospace',
                  color: theme.palette.text.secondary,
                }}
              >
                {booking.customer.phone}
              </Typography>
            </>
          ) : (
            <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
              —
            </Typography>
          )}
        </Stack>
      ),
    },
    {
      key: 'data_ora',
      label: 'Data & Ora',
      width: '170px',
      render: (booking) => (
        <Stack useFlexGap sx={{ gap: 0.25 }}>
          <Stack direction="row" useFlexGap sx={{ gap: 0.75, alignItems: 'center' }}>
            <Clock size={13} color={theme.palette.primary.main} />
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.primary,
                fontWeight: 500,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {format(new Date(booking.date), 'dd MMM yyyy', { locale: it })}
            </Typography>
          </Stack>
          <Stack direction="row" useFlexGap sx={{ gap: 0.75, alignItems: 'center' }}>
            <Clock size={11} />
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
      width: '110px',
      render: (booking) => (
        <Stack direction="row" useFlexGap sx={{ gap: 0.75, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <Timer size={12} color={theme.palette.primary.main} />
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
      label: 'Prenotato il',
      width: '125px',
      render: (booking) => (
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {format(new Date(booking.createdAt), 'dd MMM yyyy', { locale: it })}
        </Typography>
      ),
    },
    {
      key: 'stato',
      label: 'Stato',
      width: '120px',
      render: (booking) => (
        <Chip
          label={STATUS_CONFIG[booking.status]?.label ?? booking.status}
          color={STATUS_CONFIG[booking.status]?.color ?? 'default'}
          variant="filled"
          size="small"
        />
      ),
    },
    {
      key: 'prezzo',
      label: 'Prezzo',
      align: 'right',
      width: '110px',
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
      width: '110px',
      render: (booking) => {
        if (booking.status === 'COMPLETED') {
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
                  opacity: 0.6,
                  display: 'block',
                  mt: 0.25,
                }}
              >
                Fine
              </Typography>
            </Box>
          );
        }

        if (booking.status === 'CANCELLED') {
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
                  opacity: 0.6,
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
                  opacity: 0.6,
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
      key: 'note',
      label: 'Note',
      width: '160px',
      render: (booking) => (
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            maxWidth: 160,
          }}
        >
          {booking.notes || '—'}
        </Typography>
      ),
    },
    {
      key: 'allegati',
      label: 'Allegati',
      align: 'center',
      width: '90px',
      render: (booking) => (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Badge
            badgeContent={0}
            color="primary"
            overlap="circular"
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: theme.palette.primary.main,
                color: '#0a1a26',
                fontWeight: 600,
                fontSize: '0.65rem',
              },
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 191, 255, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(0, 191, 255, 0.2)',
                },
              }}
            >
              <Paperclip size={16} color={theme.palette.primary.main} />
            </Box>
          </Badge>
        </Box>
      ),
    },
  ], [theme]);

  const exportColumns = useMemo(() => [
    { label: 'Cliente', value: (b: Booking) => b.customer ? `${b.customer.firstName} ${b.customer.lastName}` : '-' },
    { label: 'Artista', value: (b: Booking) => b.artist?.name ?? '-' },
    { label: 'Data', value: (b: Booking) => format(new Date(b.date), 'dd/MM/yyyy HH:mm', { locale: it }) },
    { label: 'Durata (min)', value: (b: Booking) => b.duration },
    { label: 'Stato', value: (b: Booking) => STATUS_CONFIG[b.status]?.label ?? b.status },
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
        { value: 'CONFIRMED', label: 'Confermato' },
        { value: 'COMPLETED', label: 'Completato' },
        { value: 'CANCELLED', label: 'Annullato' },
        { value: 'RESCHEDULED', label: 'Spostato' },
      ],
      filterFn: (b, v) => !v || b.status === v,
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

  return { bookingColumns, exportColumns, exportFilters, STATUS_CONFIG };
}
