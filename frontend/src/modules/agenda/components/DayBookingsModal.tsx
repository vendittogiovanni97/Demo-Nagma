"use client";

import React from 'react';
import { alpha } from '@mui/material/styles';
import {
  Box,
  Typography,
  Stack,
  useTheme,
} from '@mui/material';
import Avatar from '@/common/components/ui/Avatar';
import { CloseButton } from '@/common/components/ui/Button';
import Icon from '@/common/components/ui/Icon';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

import SmartModal from '@/common/components/common/SmartModal';
import type { BookingModel } from '@/modules/booking/model/booking.model';
import type { BookingStatus } from '@/common/shared/types/enums';

interface DayBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  bookings: BookingModel[];
  onBookingClick: (booking: BookingModel) => void;
}

// ─── Status config ─────────────────────────────────────────────────────────
type StatusCfg = {
  label: string;
  palette: 'success' | 'error' | 'warning' | 'primary';
};

const STATUS_MAP: Record<BookingStatus, StatusCfg> = {
  CREATO:     { label: 'Nuovo',      palette: 'primary' },
  CONFERMATO: { label: 'Confermato', palette: 'success' },
  COMPLETATO: { label: 'Completato', palette: 'success' },
  MODIFICATO: { label: 'Modificato', palette: 'warning' },
  SPOSTATO:   { label: 'Spostato',   palette: 'warning' },
  ANNULLATO:  { label: 'Annullato',  palette: 'error' },
  CANCELLATO: { label: 'Cancellato', palette: 'error' },
};

// ─── Helpers ───────────────────────────────────────────────────────────────
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}

// ─── Booking Card ──────────────────────────────────────────────────────────
interface BookingCardProps {
  booking: BookingModel;
  onBookingClick: (booking: BookingModel) => void;
  onClose: () => void;
}

function BookingCard({ booking, onBookingClick, onClose }: BookingCardProps) {
  const theme = useTheme();
  const artistColor = booking.artistColor || booking.artist?.color || theme.palette.primary.main;
  const bookingTime = format(new Date(booking.date), 'HH:mm');

  const firstName = booking.customer?.firstName
    || (booking.customerName ? booking.customerName.split(' ')[0] : 'U');
  const lastName = booking.customer?.lastName
    || (booking.customerName ? booking.customerName.split(' ').slice(1).join(' ') : '');
  const customerFullName = booking.customer
    ? `${booking.customer.firstName} ${booking.customer.lastName || ''}`.trim()
    : (booking.customerName || 'Cliente');

  const statusCfg = STATUS_MAP[booking.status] ?? { label: booking.status, palette: 'primary' as const };
  const statusColor = theme.palette[statusCfg.palette]?.main ?? theme.palette.primary.main;

  const isCancelled = booking.status === 'ANNULLATO' || booking.status === 'CANCELLATO';
  const isCompleted = booking.status === 'COMPLETATO';

  return (
    <Box
      onClick={() => { onBookingClick(booking); onClose(); }}
      sx={{
        p: 2,
        borderRadius: '14px',
        backgroundColor: alpha(theme.palette.common.white, 0.035),
        border: `1px solid ${artistColor}28`,
        backdropFilter: 'blur(10px)',
        boxShadow: `0 4px 16px rgba(0,0,0,0.18), inset 0 1px 0 ${alpha(theme.palette.common.white, 0.05)}`,
        cursor: 'pointer',
        transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isCancelled ? 0.55 : 1,
        '&:hover': {
          backgroundColor: alpha(theme.palette.common.white, 0.055),
          borderColor: artistColor,
          boxShadow: `0 8px 28px ${artistColor}20, inset 0 1px 0 ${alpha(theme.palette.common.white, 0.09)}`,
          transform: 'translateY(-2px)',
          '& .arrow-icon': {
            transform: 'translateX(5px)',
            color: artistColor,
          },
        },
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 1.5 }}>
        {/* Left: colored accent bar */}
        <Box
          sx={{
            width: 4,
            borderRadius: '2px',
            backgroundColor: artistColor,
            boxShadow: `0 0 10px ${artistColor}80`,
            alignSelf: 'stretch',
            flexShrink: 0,
            minHeight: 50,
          }}
        />

        {/* Main content */}
        <Stack sx={{ flex: 1, gap: 1 }}>
          {/* ROW 1: Time pill + Duration + Status */}
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {/* Time */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.3,
                borderRadius: '20px',
                backgroundColor: `${artistColor}14`,
                border: `1px solid ${artistColor}28`,
              }}
            >
              <Icon name="clock" size={11} color={artistColor} />
              <Typography
                sx={{
                  fontWeight: 800,
                  color: 'common.white',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  lineHeight: 1,
                }}
              >
                {bookingTime}
              </Typography>
            </Box>

            {/* Duration */}
            <Typography
              sx={{
                fontSize: '0.7rem',
                color: alpha(theme.palette.common.white, 0.5),
                fontWeight: 500,
              }}
            >
              {formatDuration(booking.duration || 60)}
            </Typography>

            {/* Status badge */}
            <Box
              sx={{
                ml: 'auto',
                px: 0.8,
                py: 0.2,
                borderRadius: '6px',
                backgroundColor: alpha(statusColor, 0.14),
                border: `1px solid ${alpha(statusColor, 0.3)}`,
                boxShadow: isCompleted ? `0 0 8px ${statusColor}30` : 'none',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  color: statusColor,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                }}
              >
                {statusCfg.label}
              </Typography>
            </Box>
          </Stack>

          {/* ROW 2: Client */}
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
            <Avatar
              firstName={firstName}
              lastName={lastName}
              color={artistColor}
              size="sm"
              sx={{
                width: 26,
                height: 26,
                fontSize: '0.72rem',
                border: `1px solid ${artistColor}35`,
                boxShadow: `0 0 10px ${artistColor}12`,
                flexShrink: 0,
              }}
            />
            <Typography
              sx={{
                fontWeight: 700,
                color: 'common.white',
                fontSize: '0.875rem',
                letterSpacing: '-0.1px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {customerFullName}
            </Typography>
          </Stack>

          {/* ROW 3: Staff */}
          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: artistColor,
                boxShadow: `0 0 8px ${artistColor}`,
                flexShrink: 0,
              }}
            />
            <Typography
              sx={{
                color: alpha(theme.palette.common.white, 0.6),
                fontSize: '0.75rem',
                fontWeight: 500,
              }}
            >
              {booking.artist?.name || booking.artistName || 'Non assegnato'}
            </Typography>

            {/* Price (if > 0) */}
            {booking.price > 0 && (
              <>
                <Box sx={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: alpha(theme.palette.common.white, 0.2) }} />
                <Typography
                  sx={{
                    color: alpha(theme.palette.common.white, 0.45),
                    fontSize: '0.72rem',
                    fontWeight: 600,
                  }}
                >
                  €{booking.price.toFixed(0)}
                </Typography>
              </>
            )}
          </Stack>
        </Stack>

        {/* Right: Arrow icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', alignSelf: 'center', pl: 0.5 }}>
          <Icon
            name="arrowRight"
            size={15}
            className="arrow-icon"
            color={alpha(theme.palette.common.white, 0.3)}
          />
        </Box>
      </Stack>
    </Box>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────
function EmptyState() {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: alpha(theme.palette.common.white, 0.04),
          border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
        }}
      >
        <Icon name="calendar" size={24} color={alpha(theme.palette.common.white, 0.3)} />
      </Box>
      <Typography sx={{ color: alpha(theme.palette.common.white, 0.5), fontWeight: 600, fontSize: '0.875rem' }}>
        Nessun appuntamento
      </Typography>
      <Typography sx={{ color: alpha(theme.palette.common.white, 0.3), fontSize: '0.78rem', textAlign: 'center' }}>
        Non ci sono prenotazioni per questo giorno
      </Typography>
    </Box>
  );
}

// ─── Main Modal ────────────────────────────────────────────────────────────
export default function DayBookingsModal({
  isOpen,
  onClose,
  date,
  bookings,
  onBookingClick,
}: DayBookingsModalProps) {
  const theme = useTheme();
  if (!date) return null;

  const formattedDate = format(date, 'EEEE d MMMM', { locale: it });
  const count = bookings.length;

  return (
    <SmartModal
      isOpen={isOpen}
      onClose={onClose}
      title="Appuntamenti"
      headerAction={
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, ml: 1 }}>
          {/* Date chip */}
          <Typography
            variant="caption"
            sx={{
              color: alpha(theme.palette.common.white, 0.65),
              textTransform: 'capitalize',
              fontSize: '0.82rem',
              fontWeight: 600,
              letterSpacing: '0.01em',
            }}
          >
            {formattedDate}
          </Typography>

          {/* Count badge */}
          {count > 0 && (
            <Box
              sx={{
                px: 0.9,
                py: 0.15,
                borderRadius: '20px',
                backgroundColor: alpha(theme.palette.primary.main, 0.18),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
                boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: theme.palette.primary.main,
                  lineHeight: 1.2,
                  letterSpacing: '0.02em',
                }}
              >
                {count}
              </Typography>
            </Box>
          )}
        </Stack>
      }
      showFooter={false}
      maxWidth="sm"
    >
      <Stack spacing={1.5}>
        {count === 0 ? (
          <EmptyState />
        ) : (
          bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onBookingClick={onBookingClick}
              onClose={onClose}
            />
          ))
        )}
      </Stack>

      {/* Footer close */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mt: 2.5,
          pt: 2,
          borderTop: `1px solid ${alpha(theme.palette.common.white, 0.06)}`,
        }}
      >
        <CloseButton onClick={onClose} size="sm" sx={{ px: 2.5, py: 0.8 }} />
      </Box>
    </SmartModal>
  );
}
