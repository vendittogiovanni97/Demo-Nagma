'use client';

import { Stack, Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import Icon from '@/common/components/ui/Icon';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import Card from '@/common/components/ui/Card';
import Badge from '@/common/components/ui/Badge';
import Button from '@/common/components/ui/Button';
import PermissionGate from '@/common/components/auth/PermissionGate';
import type { Booking, BookingStatus } from '@/modules/booking/model/booking.types';
import { getBookingStatusLabel, getBookingStatusBadgeVariant } from '@/common/config/status-config';

interface BookingCardProps {
  booking: Booking;
  onEdit: (booking: Booking) => void;
  onDelete: (id: number) => void;
  onComplete: (id: number) => void;
  onRestore: (id: number) => void;
  onWhatsApp: () => void;
}


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
          <Badge variant={getBookingStatusBadgeVariant(booking.status)} size="sm">
            {getBookingStatusLabel(booking.status)}
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
                icon={<Icon name="checkCircle2" size={18} />}
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
                  icon={<Icon name="messageCircle" size={18} />}
                  title="WhatsApp"
                  sx={{
                    color: alpha(theme.palette.custom.whatsapp, 0.6),
                    '&:hover': {
                      color: theme.palette.custom.whatsapp,
                      backgroundColor: alpha(theme.palette.custom.whatsapp, 0.063),
                    },
                  }}
                  onClick={() => onWhatsApp()}
                />
                <Button
                  variant="icon"
                  icon={<Icon name="edit" size={18} />}
                  title="Modifica"
                  onClick={() => onEdit(booking)}
                />
                <Button
                  variant="icon"
                  icon={<Icon name="trash2" size={18} />}
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
                icon={<Icon name="rotateCcw" size={18} />}
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
