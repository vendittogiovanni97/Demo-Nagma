"use client";

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Avatar,
  Chip,
  IconButton,
} from '@mui/material';
import { X, Calendar, User, Palette, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
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
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-container': {
          backdropFilter: 'blur(8px)',
        },
        '& .MuiPaper-root': {
          backgroundColor: 'rgba(10, 15, 30, 0.95)',
          backgroundImage: 'radial-gradient(circle at top right, rgba(145, 85, 253, 0.1), transparent 40%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 50px rgba(145, 85, 253, 0.05)',
          overflow: 'hidden',
        },
      }}
    >
      {/* HEADER */}
      <DialogTitle sx={{ p: 2.5, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box sx={{
            p: 1,
            borderRadius: '10px',
            backgroundColor: 'rgba(145, 85, 253, 0.1)',
            border: '1px solid rgba(145, 85, 253, 0.2)',
            display: 'flex',
          }}>
            <Calendar size={20} className="text-[#9155FD]" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'white', letterSpacing: -0.2, textTransform: 'capitalize' }}>
              Appuntamenti di oggi
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textTransform: 'capitalize' }}>
              {formattedDate}
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: 'white', backgroundColor: 'rgba(255,255,255,0.05)' } }}>
          <X size={18} />
        </IconButton>
      </DialogTitle>

      {/* BODY */}
      <DialogContent sx={{ p: 2.5, py: 2, maxHeight: '420px', overflowY: 'auto' }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {bookings.map((booking) => {
            const artistColor = booking.artist?.color || '#9155FD';
            const bookingTime = format(new Date(booking.date), 'HH:mm');

            return (
              <Box
                key={booking.id}
                onClick={() => {
                  onBookingClick(booking);
                  onClose();
                }}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(145, 85, 253, 0.04)',
                    borderColor: 'rgba(145, 85, 253, 0.2)',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
                    transform: 'translateY(-2px)',
                    '& .arrow-icon': {
                      transform: 'translateX(4px)',
                      color: '#9155FD',
                    }
                  }
                }}
              >
                <Stack spacing={1.5} sx={{ flex: 1 }}>
                  {/* TIME & DURATION */}
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <Clock size={13} className="text-[#9155FD]" />
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'white', fontSize: '0.85rem' }}>
                        {bookingTime}
                      </Typography>
                    </Stack>
                    <Chip
                      label={formatDuration(booking.duration || 60)}
                      size="small"
                      sx={{
                        height: '18px',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        color: 'text.secondary',
                      }}
                    />
                  </Stack>

                  {/* CUSTOMER & ARTIST */}
                  <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
                    {/* CLIENTE */}
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Avatar sx={{ width: 22, height: 22, fontSize: '0.65rem', bgcolor: 'rgba(145, 85, 253, 0.15)', color: '#A78BFA', fontWeight: 800 }}>
                        {booking.customer?.firstName[0]}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem' }}>
                        {booking.customer?.firstName} {booking.customer?.lastName}
                      </Typography>
                    </Stack>

                    {/* ARTISTA */}
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Box sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: artistColor,
                        boxShadow: `0 0 6px ${artistColor}`,
                      }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500 }}>
                        {booking.artist?.name || 'Non assegnato'}
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
      </DialogContent>

      {/* FOOTER */}
      <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.05)', justifyContent: 'flex-end' }}>
        <Button
          onClick={onClose}
          size="small"
          variant="outlined"
          sx={{
            borderRadius: '8px',
            color: 'text.secondary',
            borderColor: 'rgba(255,255,255,0.1)',
            '&:hover': {
              borderColor: 'rgba(255,255,255,0.2)',
              backgroundColor: 'rgba(255,255,255,0.03)',
            }
          }}
        >
          Chiudi
        </Button>
      </DialogActions>
    </Dialog>
  );
}
