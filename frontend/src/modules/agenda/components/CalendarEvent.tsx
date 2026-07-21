"use client";

import { memo } from 'react';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { format } from 'date-fns';
import Icon from '@/common/components/ui/Icon';

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
  SPOSTATO:   { label: 'Risc', glow: false, dimmed: false, isWarning: true },
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

  // ─── MONTH VIEW ────────────────────────────────────────────────────────────
  if (isMonthView) {
    return (
      <Box
        sx={{
          minHeight: 28,
          width: '100%',
          overflow: 'hidden',
          px: 1,
          py: 0.5,
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          position: 'relative',
          borderRadius: '6px',
          borderLeft: `4px solid ${color}`,
          background: isCompleted
            ? isLight
              ? alpha(theme.palette.success.main, 0.12)
              : `linear-gradient(135deg, rgba(0,0,0,0.4) 0%, ${color}15 100%)`
            : isLight
              ? alpha(color, 0.15)
              : `linear-gradient(135deg, ${color}25 0%, ${color}10 100%)`,
          backdropFilter: 'blur(8px)',
          boxShadow: isLight
            ? `0 1px 3px ${alpha(theme.palette.common.black, 0.06)}`
            : `0 1px 4px ${alpha(theme.palette.common.black, 0.3)}`,
          opacity,
          transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: isCompleted ? 'default' : 'pointer',
          userSelect: 'none',
          '&:hover': isCompleted ? {} : {
            background: isLight ? alpha(color, 0.25) : `linear-gradient(135deg, ${color}38 0%, ${color}18 100%)`,
            transform: 'translateY(-1px)',
            boxShadow: `0 3px 8px ${alpha(color, 0.25)}`,
          },
        }}
      >
        {/* Staff color dot */}
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: color,
            flexShrink: 0,
            boxShadow: `0 0 6px ${color}CC`,
          }}
        />

        {/* Time */}
        <Typography
          component="span"
          sx={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: isLight ? '#0284c7' : `${color}FF`,
            fontFamily: 'monospace',
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
            fontSize: '0.8125rem',
            fontWeight: 700,
            color: 'text.primary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.2,
            flex: 1,
          }}
        >
          {booking.customerName}
        </Typography>

        {/* Status badge (small) */}
        {(isCancelled || isRescheduled || isCompleted) && (
          <Box
            sx={{
              fontSize: '0.6rem',
              fontWeight: 800,
              px: 0.6,
              py: 0.2,
              borderRadius: '4px',
              backgroundColor: isCompleted
                ? alpha(theme.palette.success.main, 0.2)
                : isCancelled
                ? alpha(theme.palette.error.main, 0.2)
                : alpha(theme.palette.warning.main, 0.2),
              color: isCompleted
                ? theme.palette.success.main
                : isCancelled
                ? theme.palette.error.main
                : theme.palette.warning.main,
              textTransform: 'uppercase',
              lineHeight: 1,
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
        px: 1.25,
        py: 0.85,
        display: 'flex',
        flexDirection: 'column',
        gap: isShort ? 0.35 : 0.6,
        position: 'relative',
        cursor: isCompleted ? 'default' : 'pointer',
        userSelect: 'none',
        borderRadius: '6px',
        borderLeft: `4px solid ${color}`,
        border: `1px solid ${color}22`,
        background: isCompleted
          ? `linear-gradient(135deg, rgba(0,0,0,0.38) 0%, ${color}0C 100%)`
          : `linear-gradient(135deg, ${color}1E 0%, ${color}08 100%)`,
        backdropFilter: 'blur(12px)',
        boxShadow: isCompleted
          ? 'none'
          : `0 2px 12px -2px ${color}20, inset 0 1px 0 rgba(255,255,255,0.06)`,
        opacity,
        transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': isCompleted ? {} : {
          transform: 'translateY(-1.5px)',
          background: `linear-gradient(135deg, ${color}2E 0%, ${color}12 100%)`,
          boxShadow: `0 6px 20px -2px ${color}35, inset 0 1px 0 rgba(255,255,255,0.10)`,
          borderColor: `${color}44`,
        },
      }}
    >
      {/* ROW 1: Time + Status */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: 18 }}>
        {/* Time pill */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            px: 0.8,
            py: 0.2,
            borderRadius: '20px',
            backgroundColor: `${color}20`,
            border: `1px solid ${color}40`,
          }}
        >
          <Typography
            sx={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: isLight ? '#0284c7' : `${color}FF`,
              fontFamily: 'monospace',
              lineHeight: 1,
              letterSpacing: '0.04em',
            }}
          >
            {startTime}
            {!isShort && ` · ${duration}m`}
          </Typography>
        </Box>

        {/* Status badge */}
        {isCompleted ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: alpha(theme.palette.success.main, 0.2),
              border: `1px solid ${theme.palette.success.main}80`,
              boxShadow: `0 0 8px ${theme.palette.success.main}40`,
              flexShrink: 0,
            }}
          >
            <Icon name="check" size={10} color={theme.palette.success.main} />
          </Box>
        ) : (isCancelled || isRescheduled) ? (
          <Box
            sx={{
              px: 0.6,
              py: 0.15,
              borderRadius: '4px',
              backgroundColor: isCancelled
                ? alpha(theme.palette.error.main, 0.22)
                : alpha(theme.palette.warning.main, 0.22),
              border: `1px solid ${isCancelled ? theme.palette.error.main : theme.palette.warning.main}40`,
              fontSize: '0.58rem',
              fontWeight: 900,
              letterSpacing: '0.05em',
              color: isCancelled ? theme.palette.error.main : theme.palette.warning.main,
              textTransform: 'uppercase',
              lineHeight: 1.2,
              flexShrink: 0,
            }}
          >
            {statusCfg?.label}
          </Box>
        ) : null}
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
          fontSize: isShort ? '0.8125rem' : '0.875rem',
          letterSpacing: '-0.1px',
        }}
      >
        {booking.customerName}
      </Typography>

      {/* ROW 3: Artist badge — always shown if name available */}
      {booking.artistName && !isShort && (
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            gap: 0.5,
            px: 0.75,
            py: 0.25,
            borderRadius: '4px',
            backgroundColor: `${color}18`,
            border: `1px solid ${color}30`,
            alignSelf: 'flex-start',
            maxWidth: '100%',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              backgroundColor: color,
              boxShadow: `0 0 6px ${color}CC`,
              flexShrink: 0,
            }}
          />
          <Typography
            sx={{
              fontSize: '0.68rem',
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
        </Stack>
      )}

      {/* Short event: artist dot only */}
      {booking.artistName && isShort && (
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.4 }}>
          <Box
            sx={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              backgroundColor: color,
              boxShadow: `0 0 5px ${color}`,
              flexShrink: 0,
            }}
          />
          <Typography
            sx={{
              fontSize: '0.65rem',
              fontWeight: 600,
              color: `${color}E0`,
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
