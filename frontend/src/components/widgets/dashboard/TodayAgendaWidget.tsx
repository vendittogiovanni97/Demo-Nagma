"use client";

import type { Booking } from '@/types/booking';
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
} from '@mui/material';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Calendar, Clock } from 'lucide-react';

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

  const todayBookings = bookings?.filter((booking) => {
    const bookingDate = new Date(booking.date);
    const today = new Date();
    return (
      bookingDate.getDate() === today.getDate() &&
      bookingDate.getMonth() === today.getMonth() &&
      bookingDate.getFullYear() === today.getFullYear()
    );
  }) || [];

  return (
    <Card
      className={className}
      sx={{
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.primary.main}20`,
        borderRadius: 2,
        transition: theme.transitions.create(['all'], { duration: 300 }),
        '&:hover': {
          borderColor: theme.palette.primary.main,
          boxShadow: theme.shadows[3],
        },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardHeader
        title={
          <Stack direction="row" useFlexGap sx={{ gap: 1.5, alignItems: 'center' }}>
            <Box
              sx={{
                p: 0.75,
                borderRadius: 1.25,
                bgcolor: `${theme.palette.primary.main}15`,
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Calendar size={18} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Appuntamenti Oggi
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                {format(new Date(), 'EEEE dd MMMM', { locale: it })}
              </Typography>
            </Box>
          </Stack>
        }
        action={
          <Chip
            label={todayBookings.length}
            sx={{
              bgcolor: `${theme.palette.primary.main}15`,
              color: theme.palette.primary.main,
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          />
        }
        sx={{ pb: 1.5, borderBottom: `1px solid ${theme.palette.primary.main}12` }}
      />
      <CardContent
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.25,
          minHeight: 300,
        }}
      >
        {isLoading ? (
          <Stack useFlexGap sx={{ gap: 1.5 }}>
            <Skeleton variant="rectangular" height={56} />
            <Skeleton variant="rectangular" height={56} />
            <Skeleton variant="rectangular" height={56} />
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
                bgcolor: `${theme.palette.primary.main}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Calendar size={24} color={theme.palette.primary.main} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Nessun appuntamento oggi
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Goditi la giornata libera!
            </Typography>
          </Stack>
        ) : (
          <Stack useFlexGap sx={{ gap: 1.5 }}>
            {todayBookings.map((booking) => {
              const color = booking.artist?.color || theme.palette.primary.main;
              return (
                <Card
                  key={booking.id}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    bgcolor: `${theme.palette.primary.main}08`,
                    border: `1px solid ${theme.palette.primary.main}20`,
                    transition: theme.transitions.create(['all'], { duration: 300 }),
                    '&:hover': {
                      boxShadow: theme.shadows[1],
                      borderColor: theme.palette.primary.main,
                    },
                    borderLeft: `3px solid ${color}`,
                  }}
                >
                  <Stack direction="row" useFlexGap sx={{ gap: 1.5 }}>
                    <Stack useFlexGap sx={{ gap: 0.5, flex: 1, minWidth: 0 }}>
                      <Stack direction="row" useFlexGap sx={{ gap: 0.75, alignItems: 'center' }}>
                        <Clock size={14} color={theme.palette.primary.main} style={{ flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {format(new Date(booking.date), 'HH:mm')}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {booking.customer?.firstName} {booking.customer?.lastName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {booking.artist?.name}
                      </Typography>
                    </Stack>
                  </Stack>
                </Card>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
