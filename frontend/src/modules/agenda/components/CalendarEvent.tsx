"use client";

import { memo } from 'react';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { format } from 'date-fns';

import type { BookingModel } from '@/modules/booking/model/booking.model';

interface CalendarEventProps {
  booking: BookingModel;
  isMonthView?: boolean;
}

// Status config — centralized for consistency
const STATUS_CONFIG = {
  COMPLETATO: { label: '✓', glow: true, dimmed: true },
  ANNULLATO:  { label: 'Ann', glow: false, dimmed: true, isError: true },
  CANCELLATO: { label: 'Canc', glow: false, dimmed: true, isError: true },
  SPOSTATO:   { label: 'Spost.', glow: false, dimmed: false, isWarning: true },
  MODIFICATO: { label: 'Mod', glow: false, dimmed: false, isWarning: true },
} as const;

type StatusKey = keyof typeof STATUS_CONFIG;

function CalendarEvent({ booking, isMonthView = false }: CalendarEventProps) {
  const theme = useTheme();
  const color = booking.artistColor || theme.palette.primary.main;
  const duration = booking.duration ?? 60;
  const isShort = duration <= 45;
  const startTime = format(new Date(booking.date), 'HH:mm');

  const statusKey = booking.status as StatusKey;
  const statusCfg = STATUS_CONFIG[statusKey];
  const isCompleted = booking.status === 'COMPLETATO';
  const isCancelled = booking.status === 'ANNULLATO' || booking.status === 'CANCELLATO';
  const isRescheduled = booking.status === 'SPOSTATO' || booking.status === 'MODIFICATO';

  const opacity = statusCfg?.dimmed ? (isCompleted ? 0.72 : 0.52) : 1;

  const isLight = theme.palette.mode === 'light';

  const statusTone = isCompleted
    ? theme.palette.success.main
    : isCancelled
      ? theme.palette.error.main
      : isRescheduled
        ? theme.palette.warning.main
        : null;

  // ─── MONTH VIEW ────────────────────────────────────────────────────────────
  if (isMonthView) {
    return (
      <Box
        sx={{
          minHeight: 26,
          width: '100%',
          overflow: 'hidden',
          px: 0.75,
          py: 0.4,
          display: 'flex',
          alignItems: 'center',
          gap: 0.6,
          borderRadius: '6px',
          backgroundColor: alpha(color, isLight ? 0.1 : 0.14),
          opacity,
          transition: 'background-color 0.15s ease',
          cursor: isCompleted ? 'default' : 'pointer',
          userSelect: 'none',
          '&:hover': isCompleted
            ? {}
            : { backgroundColor: alpha(color, isLight ? 0.18 : 0.22) },
        }}
      >
        {/* Staff color dot */}
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: color,
            flexShrink: 0,
          }}
        />

        {/* Time */}
        <Typography
          component="span"
          sx={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'text.secondary',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          {startTime}
        </Typography>

        {/* Name */}
        <Typography
          component="span"
          sx={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'text.primary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.2,
            flex: 1,
            textDecoration: isCancelled ? 'line-through' : 'none',
          }}
        >
          {booking.customerName}
        </Typography>

        {/* Status badge (small) */}
        {statusTone && (
          <Box
            sx={{
              fontSize: '0.58rem',
              fontWeight: 800,
              px: 0.5,
              py: 0.15,
              borderRadius: '4px',
              backgroundColor: alpha(statusTone, 0.18),
              color: statusTone,
              textTransform: 'uppercase',
              lineHeight: 1.3,
              flexShrink: 0,
            }}
          >
            {statusCfg?.label}
          </Box>
        )}
      </Box>
    );
  }

  // ─── WEEK / DAY VIEW ──────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        height: '100%',
        overflow: 'hidden',
        px: 1,
        py: 0.75,
        display: 'flex',
        flexDirection: 'column',
        gap: isShort ? 0.25 : 0.45,
        cursor: isCompleted ? 'default' : 'pointer',
        userSelect: 'none',
        borderRadius: '6px',
        boxShadow: `inset 3px 0 0 0 ${color}`,
        backgroundColor: alpha(color, isLight ? 0.1 : 0.16),
        opacity,
        transition: 'background-color 0.15s ease',
        '&:hover': isCompleted
          ? {}
          : { backgroundColor: alpha(color, isLight ? 0.16 : 0.24) },
      }}
    >
      {/* ROW 1: Time + Status */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 0.5, minHeight: 14 }}>
        <Typography
          sx={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: 'text.secondary',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          {startTime}{!isShort && ` · ${duration}m`}
        </Typography>

        {statusTone && (
          <Box
            sx={{
              fontSize: '0.55rem',
              fontWeight: 800,
              px: 0.45,
              py: 0.1,
              borderRadius: '4px',
              backgroundColor: alpha(statusTone, 0.18),
              color: statusTone,
              textTransform: 'uppercase',
              lineHeight: 1.3,
              flexShrink: 0,
            }}
          >
            {statusCfg?.label}
          </Box>
        )}
      </Stack>

      {/* ROW 2: Customer name */}
      <Typography
        sx={{
          fontWeight: 700,
          color: 'text.primary',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          lineHeight: 1.2,
          fontSize: isShort ? '0.78rem' : '0.85rem',
          textDecoration: isCancelled ? 'line-through' : 'none',
        }}
      >
        {booking.customerName}
      </Typography>

      {/* ROW 3: Artist */}
      {booking.artistName && !isShort && (
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, overflow: 'hidden' }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: color,
              flexShrink: 0,
            }}
          />
          <Typography
            sx={{
              fontSize: '0.68rem',
              fontWeight: 500,
              color: 'text.secondary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1,
            }}
          >
            {booking.artistName}
          </Typography>
        </Stack>
      )}
    </Box>
  );
}

export default memo(CalendarEvent);
