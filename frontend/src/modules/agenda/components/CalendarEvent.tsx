"use client";

import { memo } from 'react';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import { format } from 'date-fns';
import { Check } from 'lucide-react';

import type { BookingModel } from '@/modules/booking/model/booking.model';

interface CalendarEventProps {
  booking: BookingModel;
}

function CalendarEvent({
  booking,
}: CalendarEventProps) {
  const theme = useTheme();
  const color = booking.artistColor || theme.palette.primary.main;
  const duration = booking.duration ?? 60;
  const isShort = duration <= 45;
  const startTime = format(new Date(booking.date), 'HH:mm');
  const isCancelled = booking.status === 'ANNULLATO';
  const isRescheduled = booking.status === 'SPOSTATO';
  const isCompleted = booking.status === 'COMPLETATO';

  return (
    <Box
      sx={{
        height: '100%',
        overflow: 'hidden',
        px: 1.2,
        py: 0.8,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        position: 'relative',
        cursor: isCompleted ? 'default' : 'pointer',
        userSelect: 'none',
        borderRadius: '6px',
        borderLeft: `4px solid ${color}`,
        border: `1px solid ${color}20`,
        background: isCompleted
          ? `linear-gradient(135deg, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.2) 100%), linear-gradient(135deg, ${color}14 0%, ${color}04 100%)`
          : `linear-gradient(135deg, ${color}1C 0%, ${color}08 100%)`,
        backdropFilter: 'blur(12px)',
        boxShadow: isCompleted ? 'none' : `0 2px 8px -2px ${color}15`,
        opacity: isCompleted ? 0.72 : isCancelled ? 0.5 : 1,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': isCompleted ? {} : {
          transform: 'translateY(-1.5px)',
          background: `linear-gradient(135deg, ${color}2E 0%, ${color}12 100%)`,
          boxShadow: `0 4px 16px -1px ${color}30`,
          borderColor: `${color}40`,
        },
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: 18 }}>
        <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: `${color}E2`, lineHeight: 1, letterSpacing: '0.04em', fontFamily: 'monospace' }}>
          {startTime}
          {!isShort && ` · ${duration}m`}
        </Typography>
        {isCompleted ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 14,
              height: 14,
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.25)',
              border: '1px solid #10b981',
              color: '#10b981',
              flexShrink: 0,
            }}
          >
            <Check size={8} strokeWidth={3} />
          </Box>
        ) : (isCancelled || isRescheduled) ? (
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
        ) : null}
      </Stack>

      <Typography
        sx={{
          fontWeight: 700,
          color: '#ffffff',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          lineHeight: 1.25,
          fontSize: isShort ? '0.75rem' : '0.8125rem',
          textAlign: 'left',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        }}
      >
        {booking.customerName}
      </Typography>

      {!isShort && booking.artistName && (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.4,
            px: 0.6,
            py: 0.2,
            borderRadius: '4px',
            backgroundColor: `${color}1E`,
            border: `1px solid ${color}35`,
            alignSelf: 'flex-start',
            maxWidth: '100%',
            overflow: 'hidden',
            mt: 0.25,
          }}
        >
          <Box sx={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
          <Typography
            sx={{
              fontSize: '0.625rem',
              fontWeight: 700,
              color,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1,
            }}
          >
            {booking.artistName}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default memo(CalendarEvent);
