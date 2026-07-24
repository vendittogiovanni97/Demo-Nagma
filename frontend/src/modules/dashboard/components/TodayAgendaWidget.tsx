"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Booking } from '@/modules/booking/model/booking.types';
import {
  Box,
  Stack,
  Typography,
  useTheme,
  Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import Avatar from '@/common/components/ui/Avatar';
import { Skeleton } from '@/common/components/feedback/Skeleton';
import Badge from '@/common/components/ui/Badge';
import Button from '@/common/components/ui/Button';
import Card from '@/common/components/ui/Card';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import Icon from '@/common/components/ui/Icon';
import { useRouter } from 'next/navigation';
import BookingModal from '@/modules/booking/components/modals/BookingModal';
import { useSWRConfig } from 'swr';
import { useToast } from '@/common/hooks/useToast';
import { getOperationalTodayBookings } from '@/modules/dashboard/utils/todayAgenda';
import { getBookingStatusBadgeVariant, getBookingStatusLabel } from '@/common/config/status-config';

const MAX_VISIBLE_BOOKINGS = 5;
const CLOCK_REFRESH_INTERVAL_MS = 30_000;

interface TodayAgendaWidgetProps {
  bookings?: Booking[];
  isLoading: boolean;
  className?: string;
  onSuccess?: () => void;
}

export default function TodayAgendaWidget({
  bookings,
  isLoading,
  className,
  onSuccess,
}: TodayAgendaWidgetProps) {
  const theme = useTheme();
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const toast = useToast();

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => setCurrentTime(Date.now()), CLOCK_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, []);

  const handleOpenDetails = useCallback((booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  }, []);

  const handleModalSuccess = useCallback(() => {
    mutate((key) => typeof key === 'string' && key.includes('/api/bookings'), undefined, { revalidate: true });
    if (onSuccess) {
      onSuccess();
    }
  }, [mutate, onSuccess]);

  const operationalTodayBookings = useMemo(
    () => getOperationalTodayBookings(bookings, new Date(currentTime)),
    [bookings, currentTime],
  );
  const visibleBookings = operationalTodayBookings.slice(0, MAX_VISIBLE_BOOKINGS);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    let label = '';
    if (hours > 0) label += `${hours}h`;
    if (mins > 0) label += `${hours > 0 ? ' ' : ''}${mins}m`;
    return label || `${minutes} min`;
  };

  const isLight = theme.palette.mode === 'light';

  return (
    <Card
      className={className}
      variant="glass"
      size="md"
      sx={{
        bgcolor: isLight ? 'background.paper' : alpha(theme.palette.background.default, 0.5),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
        boxShadow: isLight
          ? `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`
          : `0 8px 32px ${alpha(theme.palette.common.black, 0.4)}`,
        transition: theme.transitions.create(['all'], { duration: 300 }),
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.3),
          boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.08)}`,
        },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5, borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
        <Stack direction="row" useFlexGap sx={{ gap: 1.5, alignItems: 'center' }}>
          <Box
            sx={{
              p: 1,
              borderRadius: '10px',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon name="calendar" size={18} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', letterSpacing: '-0.3px' }}>
              Appuntamenti Oggi
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize', fontWeight: 500 }}>
              {format(new Date(), 'EEEE dd MMMM', { locale: it })}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" useFlexGap sx={{ gap: 1, alignItems: 'center', mt: 0.5, mr: 0.5 }}>
          <Box
            sx={{
              px: 2.5,
              py: 1,
              borderRadius: '12px',
              backgroundColor: alpha(theme.palette.primary.main, isLight ? 0.15 : 0.25),
              border: `2px solid ${alpha(theme.palette.primary.main, 0.45)}`,
              boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.15)}`,
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <Typography
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 900,
                fontSize: '1.125rem',
                lineHeight: 1,
                letterSpacing: '-0.01em',
              }}
            >
              {operationalTodayBookings.length} {operationalTodayBookings.length === 1 ? 'prenotazione' : 'prenotazioni'}
            </Typography>
          </Box>
          <Tooltip title="Vedi tutte le prenotazioni">
            <Button
              variant="icon"
              aria-label="Vedi tutte le prenotazioni"
              icon={<Icon name="externalLink" size={15} />}
              onClick={() => {
                const today = format(new Date(), 'yyyy-MM-dd');
                router.push(`/prenotazioni?startDate=${today}&endDate=${today}`);
              }}
              sx={{
                minWidth: 44,
                minHeight: 44,
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                  color: isLight ? 'primary.dark' : 'common.white',
                  borderColor: 'primary.main'
                },
              }}
            />
          </Tooltip>
        </Stack>
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          minHeight: { xs: 200, md: 300 },
          mt: 1.5,
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(theme.palette.primary.main, 0.15),
            borderRadius: '10px',
            '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.3) }
          }
        }}
      >
        {isLoading ? (
          <Stack useFlexGap sx={{ gap: 1.5 }}>
            <Skeleton variant="rect" height={70} sx={{ borderRadius: '12px', bgcolor: alpha(theme.palette.text.primary, 0.05) }} />
            <Skeleton variant="rect" height={70} sx={{ borderRadius: '12px', bgcolor: alpha(theme.palette.text.primary, 0.05) }} />
            <Skeleton variant="rect" height={70} sx={{ borderRadius: '12px', bgcolor: alpha(theme.palette.text.primary, 0.05) }} />
          </Stack>
        ) : operationalTodayBookings.length === 0 ? (
          <Stack
            direction="column"
            useFlexGap
            sx={{ gap: 1.5, alignItems: 'center', justifyContent: 'center', py: 6, flex: 1 }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.05)}`
              }}
            >
              <Icon name="calendar" size={24} color={theme.palette.primary.main} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Nessun appuntamento oggi
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Goditi la giornata libera!
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={1.5}>
            {visibleBookings.map((booking) => {
              const artistColor = booking.artist?.color || theme.palette.primary.main;
              const bookingTime = format(new Date(booking.date), 'HH:mm');

              const firstName = booking.customer?.firstName || 'U';
              const lastName = booking.customer?.lastName || '';
              const customerFullName = booking.customer ? `${booking.customer.firstName} ${booking.customer.lastName || ''}` : 'Cliente';

              return (
                <Box
                  key={booking.id}
                  sx={{
                    p: 2,
                    borderRadius: '14px',
                    backgroundColor: isLight ? alpha(theme.palette.primary.main, 0.03) : alpha(theme.palette.common.white, 0.03),
                    border: `1px solid ${artistColor}18`,
                    borderLeft: `4px solid ${artistColor}`,
                    boxShadow: isLight
                      ? `0 2px 8px ${alpha(theme.palette.common.black, 0.06)}`
                      : `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      borderColor: alpha(artistColor, 0.4),
                      '& .quick-actions-bar': {
                        borderColor: alpha(theme.palette.primary.main, 0.25),
                      }
                    }
                  }}
                >
                  <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
                    {/* TIME, DURATION & STATUS */}
                    <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                      {/* TIME PILL */}
                      <Box sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.6,
                        px: 1,
                        py: 0.3,
                        borderRadius: '20px',
                        backgroundColor: `${artistColor}15`,
                        border: `1px solid ${artistColor}25`,
                      }}>
                        <Icon name="clock" size={11} color={artistColor} />
                        <Typography sx={{ fontWeight: 800, color: isLight ? 'text.primary' : 'common.white', fontSize: '0.72rem', fontFamily: 'monospace', lineHeight: 1 }}>
                          {bookingTime}
                        </Typography>
                      </Box>

                      {/* DURATION */}
                      <Badge
                        label={formatDuration(booking.duration || 60)}
                        size="xs"
                        variant="default"
                      />

                      {/* STATUS */}
                      <Badge
                        label={getBookingStatusLabel(booking.status)}
                        variant={getBookingStatusBadgeVariant(booking.status)}
                        size="xs"
                      />
                    </Stack>

                    {/* CLIENT & ARTIST INFO */}
                    <Stack spacing={1}>
                      {/* CLIENT ROW */}
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                        <Avatar
                          firstName={firstName}
                          lastName={lastName}
                          color={artistColor}
                          size="sm"
                          sx={{
                            width: 24,
                            height: 24,
                            fontSize: '0.7rem',
                            border: `1px solid ${artistColor}30`,
                          }}
                        />
                        <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.82rem', letterSpacing: '-0.1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {customerFullName}
                        </Typography>
                      </Stack>

                      {/* ARTIST ROW */}
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', pl: 0.1 }}>
                        <Box sx={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          backgroundColor: artistColor,
                          boxShadow: `0 0 6px ${artistColor}`,
                          ml: 1
                        }} />
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {booking.artist?.name || 'Non assegnato'}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>

                  <Box
                    className="quick-actions-bar"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      flexShrink: 0,
                      opacity: 1,
                      p: 0.5,
                      borderRadius: '999px',
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: alpha(theme.palette.background.default, 0.55),
                      transition: theme.transitions.create(['border-color'], {
                        duration: theme.transitions.duration.short,
                      }),
                      zIndex: 2,
                    }}
                  >
                    {booking.customer?.phone && (
                      <Tooltip title="Invia WhatsApp">
                        <Button
                          variant="icon"
                          aria-label={`Invia un messaggio WhatsApp a ${customerFullName}`}
                          icon={<Icon name="messageCircle" size={18} />}
                          onClick={() => {
                            try {
                              const formattedPhone = booking.customer?.phone?.replace(/\D/g, '');
                              if (formattedPhone) {
                                window.open(`https://wa.me/${formattedPhone}`, '_blank');
                              } else {
                                toast.error("Numero di telefono non valido per WhatsApp");
                              }
                            } catch {
                              toast.error("Impossibile aprire WhatsApp");
                            }
                          }}
                          sx={{
                            minWidth: 44,
                            minHeight: 44,
                            color: 'custom.whatsapp',
                            bgcolor: alpha(theme.palette.custom.whatsapp, 0.1),
                            border: `1px solid ${alpha(theme.palette.custom.whatsapp, 0.2)}`,
                            '&:hover': {
                              bgcolor: 'custom.whatsapp',
                              color: 'common.white',
                              boxShadow: `0 0 10px ${alpha(theme.palette.custom.whatsapp, 0.4)}`,
                            }
                          }}
                        />
                      </Tooltip>
                    )}

                    <Tooltip title="Vedi dettagli">
                      <Button
                        variant="icon"
                        aria-label={`Apri i dettagli dell'appuntamento di ${customerFullName}`}
                        icon={<Icon name="externalLink" size={18} />}
                        onClick={() => handleOpenDetails(booking)}
                        sx={{
                          minWidth: 44,
                          minHeight: 44,
                          color: 'primary.main',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          '&:hover': {
                            bgcolor: 'primary.main',
                            color: 'common.white',
                            boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.4)}`,
                          }
                        }}
                      />
                    </Tooltip>
                  </Box>
                </Box>
              );
            })}
            {operationalTodayBookings.length > MAX_VISIBLE_BOOKINGS ? (
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', textAlign: 'center', py: 0.5 }}
              >
                Mostrati i prossimi {MAX_VISIBLE_BOOKINGS} appuntamenti. Usa “vedi tutte” per la lista completa.
              </Typography>
            ) : null}
          </Stack>
        )}
      </Box>

      {/* Booking Details Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={handleCloseDetails}
        onSuccess={handleModalSuccess}
        booking={selectedBooking}
      />
    </Card>
  );
}
