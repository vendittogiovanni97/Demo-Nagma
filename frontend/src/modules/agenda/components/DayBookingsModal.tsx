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
import Badge from '@/common/components/ui/Badge';
import Button from '@/common/components/ui/Button';
import Icon from '@/common/components/ui/Icon';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

import SmartModal from '@/common/components/common/SmartModal';
import type { BookingModel } from '@/modules/booking/model/booking.model';

interface DayBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  bookings: BookingModel[];
  onBookingClick: (booking: BookingModel) => void;
}

export default function DayBookingsModal({
  isOpen,
  onClose,
  date,
  bookings,
  onBookingClick,
}: DayBookingsModalProps) {
  const theme = useTheme();
  if (!date) return null;

  const formattedDate = format(date, 'EEEE d MMMM yyyy', { locale: it });

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    let label = '';
    if (hours > 0) label += `${hours}h`;
    if (mins > 0) label += `${hours > 0 ? ' ' : ''}${mins}m`;
    return label || `${minutes} min`;
  };

  return (
    <SmartModal
      isOpen={isOpen}
      onClose={onClose}
      title="Appuntamenti di oggi"
      headerAction={
        <Typography
          variant="caption"
          sx={{
            color: alpha(theme.palette.common.white, 0.6),
            textTransform: 'capitalize',
            fontSize: '0.85rem',
            fontWeight: 600,
            ml: 1,
            letterSpacing: '0.02em'
          }}
        >
          {formattedDate}
        </Typography>
      }
      showFooter={false}
      maxWidth="sm"
    >
      <Stack spacing={2}>
        {bookings.map((booking) => {
          const artistColor = booking.artistColor || booking.artist?.color || theme.palette.primary.main;
          const bookingTime = format(new Date(booking.date), 'HH:mm');

          // Handle safe customer name fallback
          const firstName = booking.customer?.firstName || (booking.customerName ? booking.customerName.split(' ')[0] : 'U');
          const lastName = booking.customer?.lastName || (booking.customerName ? booking.customerName.split(' ').slice(1).join(' ') : '');
          const customerInitials = firstName[0]?.toUpperCase() || 'U';
          const customerFullName = booking.customer ? `${booking.customer.firstName} ${booking.customer.lastName || ''}` : (booking.customerName || 'Cliente');

          return (
            <Box
              key={booking.id}
              onClick={() => {
                onBookingClick(booking);
                onClose();
              }}
              sx={{
                p: 2.2,
                borderRadius: '14px',
                backgroundColor: alpha(theme.palette.common.white, 0.035),
                border: `1px solid ${artistColor}25`,
                boxShadow: `0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 ${alpha(theme.palette.common.white, 0.06)}`,
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.05),
                  borderColor: artistColor,
                  boxShadow: `0 8px 24px ${artistColor}18, inset 0 1px 0 ${alpha(theme.palette.common.white, 0.1)}`,
                  transform: 'translateY(-2px)',
                  '& .arrow-icon': {
                    transform: 'translateX(4px)',
                    color: artistColor,
                  }
                }
              }}
            >
              <Stack spacing={2} sx={{ flex: 1 }}>
                {/* TIME & DURATION ROW */}
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  {/* TIME PILL */}
                  <Box sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.6,
                    px: 1.2,
                    py: 0.4,
                    borderRadius: '20px',
                    backgroundColor: `${artistColor}12`,
                    border: `1px solid ${artistColor}28`,
                    boxShadow: `0 2px 6px ${artistColor}05`,
                  }}>
                    <Icon name="clock" size={12} color={artistColor} />
                    <Typography sx={{ fontWeight: 800, color: theme.palette.common.white, fontSize: '0.75rem', fontFamily: 'monospace', lineHeight: 1 }}>
                      {bookingTime}
                    </Typography>
                  </Box>

                  {/* DURATION CHIP */}
                  <Badge
                    label={formatDuration(booking.duration || 60)}
                    size="sm"
                    variant="default"
                  />
                </Stack>

                {/* DETAILS SECTION */}
                <Stack spacing={1.2}>
                  {/* CLIENT ROW */}
                  <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
                    <Avatar
                      firstName={firstName}
                      lastName={lastName}
                      color={artistColor}
                      size="sm"
                      sx={{
                        width: 26,
                        height: 26,
                        fontSize: '0.75rem',
                        border: `1px solid ${artistColor}35`,
                        boxShadow: `0 0 10px ${artistColor}10`
                      }}
                    />
                    <Typography sx={{ fontWeight: 700, color: theme.palette.common.white, fontSize: '0.875rem', letterSpacing: '-0.1px' }}>
                      {customerFullName}
                    </Typography>
                  </Stack>

                  {/* ARTIST ROW */}
                  <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
                    <Box sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: artistColor,
                      boxShadow: `0 0 8px ${artistColor}`,
                      ml: 1.2 // Align beautifully with text after Avatar
                    }} />
                    <Typography sx={{ color: alpha(theme.palette.common.white, 0.65), fontSize: '0.78rem', fontWeight: 500 }}>
                      {booking.artist?.name || booking.artistName || 'Non assegnato'}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>

              {/* INTERACTIVE ACTION ICON */}
              <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
                <Icon
                  name="arrowRight"
                  size={16}
                  className="arrow-icon text-text.secondary shrink-0"
                />
              </Box>
            </Box>
          );
        })}
      </Stack>

      {/* FOOTER CLOSE BUTTON */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, pt: 2, borderTop: `1px solid ${alpha(theme.palette.common.white, 0.05)}` }}>
        <Button
          onClick={onClose}
          size="sm"
          variant="ghost"
          sx={{
            px: 2.5,
            py: 0.8,
          }}
        >
          Chiudi
        </Button>
      </Box>
    </SmartModal>
  );
}
