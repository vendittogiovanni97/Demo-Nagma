"use client";

import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Chip, Stack, Typography, Badge } from '@mui/material';
import { Clock, Phone, Timer, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { Column } from '@/components/data-display/DataTable';
import type { ExportFilter } from '@/components/modals/ExportModal';
import type { Booking, BookingStatus } from '@/modules/booking/model/booking.types';

// Consensus Integration
import { useConsentConfig } from '@/modules/newfeature/consenso/hooks/useConsentConfig';
import ConsentStatusBadge from '@/modules/newfeature/consenso/components/ConsentStatusBadge';
import { useAuth } from '@/context/AuthContext';

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: 'error' | 'primary' | 'success' | 'warning' | 'info' | 'default' | 'secondary' }> = {
  CREATO: { label: 'Creato', color: 'info' },
  CONFERMATO: { label: 'Confermato', color: 'primary' },
  COMPLETATO: { label: 'Completato', color: 'success' },
  MODIFICATO: { label: 'Modificato', color: 'warning' },
  ANNULLATO: { label: 'Annullato', color: 'error' },
  SPOSTATO: { label: 'Spostato', color: 'warning' },
  CANCELLATO: { label: 'Cancellato', color: 'default' },
};

interface UseBookingColumnsOptions {
  onAttachmentClick?: (booking: Booking) => void;
  onConsentClick?: (booking: Booking) => void;
}

export function useBookingColumns(options: UseBookingColumnsOptions = {}) {
  const theme = useTheme();
  const { onAttachmentClick, onConsentClick } = options;
  const { SHOW_CONSENSI } = useConsentConfig();
  const { isSuperAdmin } = useAuth();

  const staticColumns: Column<Booking>[] = [
    {
      key: 'cliente',
      label: 'Cliente',
      width: '250px',
      render: (booking) => (
        booking.customer ? (
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
      render: (booking) => {
        const count = booking.attachments?.length ?? 0;
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Badge
              badgeContent={count}
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
                  '&:focus-visible': {
                    outline: `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: 2,
                  },
                }}
              >
                <Paperclip size={16} color={theme.palette.primary.main} />
              </Box>
            </Badge>
          </Box>
        );
      },
    },
  ];

  const bookingColumns = useMemo(() => {
    const cols = [...staticColumns];
    if (SHOW_CONSENSI && isSuperAdmin) {
      const statusIdx = cols.findIndex(c => c.key === 'stato');
      if (statusIdx !== -1) {
        cols.splice(statusIdx, 0, {
          key: 'consenso',
          label: 'Consenso',
          width: '140px',
          render: (booking) => (
            <ConsentStatusBadge booking={booking} onClick={(e) => {
              e.stopPropagation();
              onConsentClick?.(booking);
            }} />
          ),
        });
      } else {
        cols.push({
          key: 'consenso',
          label: 'Consenso',
          width: '140px',
          render: (booking) => (
            <ConsentStatusBadge booking={booking} onClick={(e) => {
              e.stopPropagation();
              onConsentClick?.(booking);
            }} />
          ),
        });
      }
    }
    return cols;
  }, [theme, onAttachmentClick, onConsentClick, SHOW_CONSENSI, isSuperAdmin]);


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
        { value: 'CONFERMATO', label: 'Confermato' },
        { value: 'COMPLETATO', label: 'Completato' },
        { value: 'ANNULLATO', label: 'Annullato' },
        { value: 'SPOSTATO', label: 'Spostato' },
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

  return { bookingColumns, exportColumns, exportFilters, STATUS_CONFIG };
}
