'use client';

import { Stack, Box, Typography, useTheme } from '@mui/material';
import { CheckCircle2, Edit, Trash2, MessageCircle, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import Card from '@/components/ui/Card';
import Badge, { type BadgeVariant } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import PermissionGate from '@/components/auth/PermissionGate';
import type { Booking, BookingStatus } from '@/modules/booking/model/booking.types';

interface BookingCardProps {
  booking: Booking;
  onEdit: (booking: Booking) => void;
  onDelete: (id: number) => void;
  onComplete: (id: number) => void;
  onRestore: (id: number) => void;
  onWhatsApp: () => void;
}

// Helper function to get status badge variant
const getStatusVariant = (status: BookingStatus): BadgeVariant => {
  const STATUS_CLASSES: Record<BookingStatus, BadgeVariant> = {
    CREATO: 'status-created',
    CONFERMATO: 'status-confirmed',
    COMPLETATO: 'status-completed',
    MODIFICATO: 'status-updated',
    ANNULLATO: 'status-cancelled',
    SPOSTATO: 'status-rescheduled',
    CANCELLATO: 'status-deleted',
  };
  return STATUS_CLASSES[status] || 'secondary';
};

// Helper function to get status label in Italian
const getStatusLabel = (status: BookingStatus) => {
  const STATUS_LABELS: Record<BookingStatus, string> = {
    CREATO: 'Creato',
    CONFERMATO: 'Confermato',
    COMPLETATO: 'Completato',
    MODIFICATO: 'Modificato',
    ANNULLATO: 'Annullato',
    SPOSTATO: 'Spostato',
    CANCELLATO: 'Cancellato',
  };
  return STATUS_LABELS[status] || status;
};

export default function BookingCard({
  booking,
  onEdit,
  onDelete,
  onComplete,
  onRestore,
  onWhatsApp,
}: BookingCardProps) {
  const theme = useTheme();

  const customerName = booking.customer
    ? `${booking.customer.firstName} ${booking.customer.lastName}`
    : 'Cliente sconosciuto';

  const artistName = booking.artist?.name || 'Artista sconosciuto';

  // Format date and time
  const bookingDate = new Date(booking.date);
  const formattedDate = format(bookingDate, 'EEEE d MMMM yyyy', { locale: it });
  const formattedTime = format(bookingDate, 'HH:mm');

  const cardBgColor =
    booking.status === 'COMPLETATO' ? `${theme.palette.success.main}08` :
    booking.status === 'ANNULLATO' ? `${theme.palette.error.main}08` :
    undefined;

  return (
    <Card
      variant="glass"
      size="md"
      sx={cardBgColor ? { backgroundColor: cardBgColor } : undefined}
    >
      <Stack spacing={2}>
        {/* Header: Customer Info + Status Badge */}
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Stack spacing={0.5} sx={{ flex: 1 }}>
            {/* Customer Details */}
            <Typography
              variant="h6"
              sx={{
                fontSize: '14px',
                fontWeight: 600,
                color: theme.palette.text.primary,
              }}
            >
              {customerName}
            </Typography>
            {booking.customer?.phone && (
              <Typography
                variant="body2"
                sx={{
                  fontSize: '12px',
                  color: theme.palette.text.secondary,
                }}
              >
                {booking.customer.phone}
              </Typography>
            )}
          </Stack>

          {/* Status Badge */}
          <Badge variant={getStatusVariant(booking.status)} size="sm">
            {getStatusLabel(booking.status)}
          </Badge>
        </Stack>

        {/* Divider */}
        <Box
          sx={{
            height: '1px',
            backgroundColor: theme.palette.divider,
          }}
        />

        {/* Artist + Duration Info */}
        <Stack spacing={1}>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: '12px',
                color: theme.palette.text.secondary,
                fontWeight: 500,
              }}
            >
              Artista
            </Typography>
            <Typography
              sx={{
                fontSize: '13px',
                color: booking.artist?.color || theme.palette.primary.main,
                fontWeight: 600,
              }}
            >
              {artistName}
            </Typography>
          </Stack>

          {/* Duration */}
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: '12px',
                color: theme.palette.text.secondary,
                fontWeight: 500,
              }}
            >
              Durata
            </Typography>
            <Typography
              sx={{
                fontSize: '13px',
                color: theme.palette.text.primary,
                fontWeight: 600,
              }}
            >
              {booking.duration} min
            </Typography>
          </Stack>
        </Stack>

        {/* Date and Time Info */}
        <Stack spacing={1}>
          <Typography
            variant="body2"
            sx={{
              fontSize: '12px',
              color: theme.palette.text.secondary,
              fontWeight: 500,
            }}
          >
            Data e Ora
          </Typography>
          <Stack spacing={0.5}>
            <Typography
              sx={{
                fontSize: '13px',
                color: theme.palette.text.primary,
                fontWeight: 500,
              }}
            >
              {formattedDate}
            </Typography>
            <Typography
              sx={{
                fontSize: '12px',
                color: theme.palette.text.secondary,
              }}
            >
              {formattedTime}
            </Typography>
          </Stack>
        </Stack>

        {/* Price Section */}
        {booking.price && (
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: '12px',
                color: theme.palette.text.secondary,
                fontWeight: 500,
              }}
            >
              Prezzo
            </Typography>
            <Typography
              sx={{
                fontSize: '14px',
                color: theme.palette.primary.main,
                fontWeight: 700,
              }}
            >
              €{booking.price.toFixed(2)}
            </Typography>
          </Stack>
        )}

        {/* Divider */}
        <Box
          sx={{
            height: '1px',
            backgroundColor: theme.palette.divider,
          }}
        />

        {/* Action Buttons */}
        <PermissionGate requireAdmin>
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
            {booking.status !== 'COMPLETATO' && booking.status !== 'ANNULLATO' && (
              <Button
                variant="icon"
                icon={<CheckCircle2 size={18} />}
                title="Completato"
                sx={{
                  color: `${theme.palette.success.main}99`,
                  '&:hover': {
                    color: theme.palette.success.main,
                    backgroundColor: `${theme.palette.success.main}10`,
                  },
                }}
                onClick={() => onComplete(booking.id)}
              />
            )}
            {booking.status !== 'COMPLETATO' && booking.status !== 'ANNULLATO' && (
              <>
                <Button
                  variant="icon"
                  icon={<MessageCircle size={18} />}
                  title="WhatsApp"
                  sx={{
                    color: `#25D36699`,
                    '&:hover': {
                      color: '#25D366',
                      backgroundColor: '#25D36610',
                    },
                  }}
                  onClick={() => onWhatsApp()}
                />
                <Button
                  variant="icon"
                  icon={<Edit size={18} />}
                  title="Modifica"
                  onClick={() => onEdit(booking)}
                />
                <Button
                  variant="icon"
                  icon={<Trash2 size={18} />}
                  sx={{
                    color: `${theme.palette.error.main}99`,
                    '&:hover': {
                      color: theme.palette.error.main,
                      backgroundColor: `${theme.palette.error.main}10`,
                    },
                  }}
                  title="Elimina"
                  onClick={() => onDelete(booking.id)}
                />
              </>
            )}
            {booking.status === 'ANNULLATO' && (
              <Button
                variant="icon"
                icon={<RotateCcw size={18} />}
                title="Ripristina"
                sx={{
                  color: `${theme.palette.warning.main}99`,
                  '&:hover': {
                    color: theme.palette.warning.main,
                    backgroundColor: `${theme.palette.warning.main}10`,
                  },
                }}
                onClick={() => onRestore(booking.id)}
              />
            )}
          </Stack>
        </PermissionGate>
      </Stack>
    </Card>
  );
}
