"use client";

import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Avatar,
  Chip,
  Button,
} from '@mui/material';
import { Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

import SmartModal from '@/components/common/SmartModal';
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
            color: 'rgba(255, 255, 255, 0.6)',
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
          const artistColor = booking.artistColor || booking.artist?.color || '#00BFFF';
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
                backgroundColor: 'rgba(255, 255, 255, 0.035)',
                border: `1px solid ${artistColor}25`,
                boxShadow: `0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.06)`,
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: artistColor,
                  boxShadow: `0 8px 24px ${artistColor}18, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
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
                    <Clock size={12} style={{ color: artistColor }} />
                    <Typography sx={{ fontWeight: 800, color: 'white', fontSize: '0.75rem', fontFamily: 'monospace', lineHeight: 1 }}>
                      {bookingTime}
                    </Typography>
                  </Box>

                  {/* DURATION CHIP */}
                  <Chip
                    label={formatDuration(booking.duration || 60)}
                    size="small"
                    sx={{
                      height: '20px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: 'rgba(255, 255, 255, 0.75)',
                    }}
                  />
                </Stack>

                {/* DETAILS SECTION */}
                <Stack spacing={1.2}>
                  {/* CLIENT ROW */}
                  <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
                    <Avatar sx={{
                      width: 26,
                      height: 26,
                      fontSize: '0.75rem',
                      bgcolor: `${artistColor}1A`,
                      color: artistColor,
                      fontWeight: 800,
                      border: `1px solid ${artistColor}35`,
                      boxShadow: `0 0 10px ${artistColor}10`
                    }}>
                      {customerInitials}
                    </Avatar>
                    <Typography sx={{ fontWeight: 700, color: '#ffffff', fontSize: '0.875rem', letterSpacing: '-0.1px' }}>
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
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.78rem', fontWeight: 500 }}>
                      {booking.artist?.name || booking.artistName || 'Non assegnato'}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>

              {/* INTERACTIVE ACTION ICON */}
              <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
                <ArrowRight
                  size={16}
                  className="arrow-icon text-text.secondary shrink-0"
                  style={{ transition: 'all 0.2s ease-in-out' }}
                />
              </Box>
            </Box>
          );
        })}
      </Stack>

      {/* FOOTER CLOSE BUTTON */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Button
          onClick={onClose}
          size="small"
          variant="outlined"
          sx={{
            borderRadius: '8px',
            color: 'rgba(255, 255, 255, 0.7)',
            borderColor: 'rgba(255,255,255,0.1)',
            textTransform: 'none',
            fontSize: '0.8rem',
            px: 2.5,
            py: 0.8,
            '&:hover': {
              borderColor: 'rgba(255,255,255,0.25)',
              backgroundColor: 'rgba(255,255,255,0.04)',
              color: 'white',
            }
          }}
        >
          Chiudi
        </Button>
      </Box>
    </SmartModal>
  );
}
