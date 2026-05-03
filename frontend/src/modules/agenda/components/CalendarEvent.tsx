"use client";

import { memo } from 'react';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import { format } from 'date-fns';

import type { Booking } from '@/modules/booking/model/booking.types';

interface CalendarEventProps {
  booking: Booking;
}

function CalendarEvent({
  booking,
}: CalendarEventProps) {
  const theme = useTheme();
  const color = booking.artist?.color ?? theme.palette.primary.main;
  const duration = booking.duration ?? 60;
  const isShort = duration <= 45;
  const startTime = format(new Date(booking.date), 'HH:mm');
  const isCancelled = booking.status === 'ANNULLATO';
  const isRescheduled = booking.status === 'SPOSTATO';

  return (
    <Box
      sx={{
        height: '100%',
        overflow: 'hidden',
        px: 0.75,
        py: 0.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.25,
        position: 'relative',
        cursor: 'pointer',
        userSelect: 'none',
        background: `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`,
        opacity: isCancelled ? 0.5 : 1,
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: 20 }}>
        <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: `${color}cc`, lineHeight: 1, letterSpacing: '0.04em' }}>
          {startTime}
          {!isShort && ` · ${duration}min`}
        </Typography>
        {(isCancelled || isRescheduled) && (
          <Box
            sx={{
              px: 0.5,
              py: 0.1,
              borderRadius: '3px',
              backgroundColor: isCancelled
                ? `${theme.palette.error.main}30`
                : `${theme.palette.warning.main}30`,
              fontSize: '0.5rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              color: isCancelled ? theme.palette.error.main : theme.palette.warning.main,
              textTransform: 'uppercase',
              lineHeight: 1.4,
            }}
          >
            {isCancelled ? 'Ann.' : 'Risc.'}
          </Box>
        )}
      </Stack>

      <Typography
        sx={{
          fontWeight: 700,
          color: '#fff',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          lineHeight: 1.2,
          fontSize: isShort ? '0.75rem' : '0.8rem',
          textAlign: 'center',
        }}
      >
        {booking.customer?.firstName} {booking.customer?.lastName}
      </Typography>

      {!isShort && booking.artist && (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.4,
            px: 0.6,
            py: 0.15,
            borderRadius: '4px',
            backgroundColor: `${color}25`,
            border: `1px solid ${color}40`,
            alignSelf: 'center',
            maxWidth: '100%',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
          <Typography
            sx={{
              fontSize: '0.65rem',
              fontWeight: 700,
              color,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1,
            }}
          >
            {booking.artist.name}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default memo(CalendarEvent);
