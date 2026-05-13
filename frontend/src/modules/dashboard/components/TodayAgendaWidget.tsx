"use client";

import type { Booking } from '@/modules/booking/model/booking.types';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Skeleton,
  Stack,
  Typography,
  useTheme,
  Avatar,
} from '@mui/material';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Calendar, Clock, ExternalLink, MessageCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { IconButton, Tooltip } from '@mui/material';

interface TodayAgendaWidgetProps {
  bookings?: Booking[];
  isLoading: boolean;
  className?: string;
}

export default function TodayAgendaWidget({
  bookings,
  isLoading,
  className,
}: TodayAgendaWidgetProps) {
  const theme = useTheme();
  const router = useRouter();

  const todayBookings = bookings?.filter((booking) => {
    const bookingDate = new Date(booking.date);
    const today = new Date();
    return (
      bookingDate.getDate() === today.getDate() &&
      bookingDate.getMonth() === today.getMonth() &&
      bookingDate.getFullYear() === today.getFullYear()
    );
  }) || [];

  // STATS CALCULATIONS
  const totalEarnings = todayBookings.reduce((acc, b) => acc + (b.price || 0), 0);
  const totalHours = Math.round(todayBookings.reduce((acc, b) => acc + (b.duration || 60), 0) / 60 * 10) / 10;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    let label = '';
    if (hours > 0) label += `${hours}h`;
    if (mins > 0) label += `${hours > 0 ? ' ' : ''}${mins}m`;
    return label || `${minutes} min`;
  };

  const getStatusBadge = (status: string, color: string) => {
    const statusMap: Record<string, { label: string, color: string, bgcolor: string }> = {
      CONFERMATO: { label: 'Confermato', color: '#10B981', bgcolor: 'rgba(16, 185, 129, 0.12)' },
      CREATO: { label: 'Creato', color: '#00BFFF', bgcolor: 'rgba(0, 191, 255, 0.12)' },
      COMPLETATO: { label: 'Completato', color: '#8B5CF6', bgcolor: 'rgba(139, 92, 246, 0.12)' },
      ANNULLATO: { label: 'Annullato', color: '#EF4444', bgcolor: 'rgba(239, 68, 68, 0.12)' },
      CANCELLATO: { label: 'Cancellato', color: '#EF4444', bgcolor: 'rgba(239, 68, 68, 0.12)' },
      SPOSTATO: { label: 'Spostato', color: '#F59E0B', bgcolor: 'rgba(245, 158, 11, 0.12)' },
    };

    const config = statusMap[status] || { label: status, color: '#94A3B8', bgcolor: 'rgba(148, 163, 184, 0.12)' };

    return (
      <Box sx={{
        px: 1,
        py: 0.25,
        borderRadius: '4px',
        backgroundColor: config.bgcolor,
        border: `1px solid ${config.color}20`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Typography variant="caption" sx={{ color: config.color, fontWeight: 700, fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
          {config.label}
        </Typography>
      </Box>
    );
  };

  return (
    <Card
      className={className}
      sx={{
        background: 'rgba(10, 26, 38, 0.5)',
        backdropFilter: 'blur(20px)',
        border: `1px solid rgba(0, 191, 255, 0.15)`,
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
        transition: theme.transitions.create(['all'], { duration: 300 }),
        '&:hover': {
          borderColor: 'rgba(0, 191, 255, 0.3)',
          boxShadow: '0 12px 40px rgba(0, 191, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <CardHeader
        title={
          <Stack direction="row" useFlexGap sx={{ gap: 1.5, alignItems: 'center' }}>
            <Box
              sx={{
                p: 1,
                borderRadius: '10px',
                bgcolor: 'rgba(0, 191, 255, 0.1)',
                color: '#00BFFF',
                border: '1px solid rgba(0, 191, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Calendar size={18} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', letterSpacing: '-0.3px' }}>
                Appuntamenti Oggi
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize', fontWeight: 500 }}>
                {format(new Date(), 'EEEE dd MMMM', { locale: it })}
              </Typography>
            </Box>
          </Stack>
        }
        action={
          <Stack direction="row" useFlexGap sx={{ gap: 1, alignItems: 'center', mt: 0.5, mr: 0.5 }}>
            <Chip
              label={todayBookings.length}
              sx={{
                bgcolor: 'rgba(0, 191, 255, 0.15)',
                color: '#00BFFF',
                border: '1px solid rgba(0, 191, 255, 0.2)',
                fontWeight: 800,
                fontSize: '0.75rem',
              }}
            />
            <Tooltip title="Vedi tutte le prenotazioni">
              <IconButton
                size="small"
                onClick={() => {
                  const today = format(new Date(), 'yyyy-MM-dd');
                  router.push(`/prenotazioni?startDate=${today}&endDate=${today}`);
                }}
                sx={{
                  color: '#00BFFF',
                  bgcolor: 'rgba(0, 191, 255, 0.05)',
                  border: '1px solid rgba(0, 191, 255, 0.1)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'rgba(0, 191, 255, 0.15)',
                    color: 'white',
                    borderColor: '#00BFFF'
                  },
                }}
              >
                <ExternalLink size={15} />
              </IconButton>
            </Tooltip>
          </Stack>
        }
        sx={{ pb: 1.5, borderBottom: `1px solid rgba(0, 191, 255, 0.1)` }}
      />
      <CardContent
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          minHeight: { xs: 200, md: 300 },
          p: 2.2,
          '&:last-child': { pb: 2.2 },
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 191, 255, 0.15)',
            borderRadius: '10px',
            '&:hover': { backgroundColor: 'rgba(0, 191, 255, 0.3)' }
          }
        }}
      >
        {isLoading ? (
          <Stack useFlexGap sx={{ gap: 1.5 }}>
            <Skeleton variant="rectangular" height={70} sx={{ borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.03)' }} />
            <Skeleton variant="rectangular" height={70} sx={{ borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.03)' }} />
            <Skeleton variant="rectangular" height={70} sx={{ borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.03)' }} />
          </Stack>
        ) : todayBookings.length === 0 ? (
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
                bgcolor: 'rgba(0, 191, 255, 0.1)',
                border: '1px solid rgba(0, 191, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(0, 191, 255, 0.05)'
              }}
            >
              <Calendar size={24} color="#00BFFF" />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'white' }}>
              Nessun appuntamento oggi
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Goditi la giornata libera!
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={1.5}>
            {/* STATS HEADER */}
            <Stack direction="row" spacing={1.2} sx={{ mb: 0.5 }}>
              <Box sx={{
                flex: 1,
                p: 1.2,
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(0, 191, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.2,
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.03)'
              }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Prenotati
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 800, color: 'white', fontSize: '1rem', fontFamily: 'Outfit, sans-serif' }}>
                  {todayBookings.length}
                </Typography>
              </Box>

              <Box sx={{
                flex: 1,
                p: 1.2,
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(0, 191, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.2,
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.03)'
              }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Ore Totali
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 800, color: '#00BFFF', fontSize: '1rem', fontFamily: 'Outfit, sans-serif' }}>
                  {totalHours}h
                </Typography>
              </Box>

              <Box sx={{
                flex: 1,
                p: 1.2,
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(0, 191, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.2,
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.03)'
              }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Valore
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 800, color: '#10B981', fontSize: '1rem', fontFamily: 'Outfit, sans-serif' }}>
                  €{totalEarnings}
                </Typography>
              </Box>
            </Stack>

            {/* BOOKINGS LIST */}
            {todayBookings.map((booking) => {
              const artistColor = booking.artist?.color || '#00BFFF';
              const bookingTime = format(new Date(booking.date), 'HH:mm');

              const firstName = booking.customer?.firstName || 'U';
              const lastName = booking.customer?.lastName || '';
              const customerInitials = firstName[0]?.toUpperCase() || 'U';
              const customerFullName = booking.customer ? `${booking.customer.firstName} ${booking.customer.lastName || ''}` : 'Cliente';

              return (
                <Box
                  key={booking.id}
                  onClick={() => {
                    router.push(`/prenotazioni?id=${booking.id}`);
                  }}
                  sx={{
                    p: 2,
                    borderRadius: '14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${artistColor}18`,
                    borderLeft: `4px solid ${artistColor}`,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderColor: artistColor,
                      boxShadow: `0 8px 24px ${artistColor}15, inset 0 1px 0 rgba(255, 255, 255, 0.08)`,
                      transform: 'translateY(-2px)',
                      '& .arrow-icon': {
                        transform: 'translateX(4px)',
                        opacity: 0,
                      },
                      '& .quick-actions-bar': {
                        opacity: 1,
                        transform: 'translateX(0)',
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
                        <Clock size={11} style={{ color: artistColor }} />
                        <Typography sx={{ fontWeight: 800, color: 'white', fontSize: '0.72rem', fontFamily: 'monospace', lineHeight: 1 }}>
                          {bookingTime}
                        </Typography>
                      </Box>

                      {/* DURATION */}
                      <Chip
                        label={formatDuration(booking.duration || 60)}
                        size="small"
                        sx={{
                          height: '18px',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          color: 'rgba(255, 255, 255, 0.65)',
                        }}
                      />

                      {/* STATUS */}
                      {getStatusBadge(booking.status, artistColor)}
                    </Stack>

                    {/* CLIENT & ARTIST INFO */}
                    <Stack spacing={1}>
                      {/* CLIENT ROW */}
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                        <Avatar sx={{
                          width: 24,
                          height: 24,
                          fontSize: '0.7rem',
                          bgcolor: `${artistColor}1F`,
                          color: artistColor,
                          fontWeight: 800,
                          border: `1px solid ${artistColor}30`,
                        }}>
                          {customerInitials}
                        </Avatar>
                        <Typography sx={{ fontWeight: 700, color: 'white', fontSize: '0.82rem', letterSpacing: '-0.1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                          ml: 1 // Aligns dot beautifully under text
                        }} />
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '0.75rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {booking.artist?.name || 'Non assegnato'}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>

                  {/* INTERACTIVE ACTION ICON */}
                  <Box
                    className="arrow-icon"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      pl: 1,
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      opacity: 0.3,
                    }}
                  >
                    <ArrowRight size={16} style={{ color: 'white' }} />
                  </Box>

                  {/* QUICK ACTION BAR (FADES IN ON HOVER) */}
                  <Box
                    className="quick-actions-bar"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      opacity: 0,
                      transform: 'translateX(8px)',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'absolute',
                      right: 16,
                      zIndex: 2,
                    }}
                    onClick={(e) => e.stopPropagation()} // Prevent card redirection on action click
                  >
                    {booking.customer?.phone && (
                      <Tooltip title="Invia WhatsApp">
                        <IconButton
                          size="small"
                          onClick={() => {
                            const formattedPhone = booking.customer?.phone?.replace(/\D/g, '');
                            window.open(`https://wa.me/${formattedPhone}`, '_blank');
                          }}
                          sx={{
                            color: '#25D366',
                            bgcolor: 'rgba(37, 211, 102, 0.1)',
                            border: '1px solid rgba(37, 211, 102, 0.2)',
                            width: 28,
                            height: 28,
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: '#25D366',
                              color: 'white',
                              boxShadow: '0 0 10px rgba(37, 211, 102, 0.4)',
                            }
                          }}
                        >
                          <MessageCircle size={13} />
                        </IconButton>
                      </Tooltip>
                    )}

                    <Tooltip title="Vedi Dettagli">
                      <IconButton
                        size="small"
                        onClick={() => {
                          router.push(`/prenotazioni?id=${booking.id}`);
                        }}
                        sx={{
                          color: '#00BFFF',
                          bgcolor: 'rgba(0, 191, 255, 0.1)',
                          border: '1px solid rgba(0, 191, 255, 0.2)',
                          width: 28,
                          height: 28,
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: '#00BFFF',
                            color: 'white',
                            boxShadow: '0 0 10px rgba(0, 191, 255, 0.4)',
                          }
                        }}
                      >
                        <ExternalLink size={13} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
