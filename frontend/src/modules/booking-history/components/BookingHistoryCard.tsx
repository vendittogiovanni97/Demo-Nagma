"use client";

import { Box, Chip, Stack, Typography, useTheme } from '@mui/material';
import { CalendarDays, User } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

import type { BookingAction, BookingHistoryEntry } from '@/modules/booking-history/api/booking-history.api';

interface BookingHistoryCardProps {
  entry: BookingHistoryEntry;
  onClick?: () => void;
}

const ACTION_CONFIG: Record<
  BookingAction,
  { label: string; color: string; bg: string }
> = {
  CREATO:     { label: 'Creato',     color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)' },
  CONFERMATO: { label: 'Confermato', color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)' },
  MODIFICATO:     { label: 'Modificato', color: '#d97706', bg: 'rgba(217, 119, 6, 0.2)' },
  SPOSTATO: { label: 'Spostato',   color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.2)' },
  ANNULLATO:   { label: 'Annullato',  color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)' },
  COMPLETATO:   { label: 'Completato', color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)' },
  CANCELLATO: { label: 'Cancellato', color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.2)' },
};

function renderDetails(entry: BookingHistoryEntry) {
  if (entry.oldDate || entry.newDate) {
    return (
      <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        {entry.oldDate && (
          <Typography sx={{ color: '#ef4444', textDecoration: 'line-through', fontSize: '0.8125rem' }}>
            {format(new Date(entry.oldDate), 'dd/MM/yyyy HH:mm', { locale: it })}
          </Typography>
        )}
        {entry.oldDate && entry.newDate && (
          <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>→</Typography>
        )}
        {entry.newDate && (
          <Typography sx={{ color: '#10b981', fontSize: '0.8125rem' }}>
            {format(new Date(entry.newDate), 'dd/MM/yyyy HH:mm', { locale: it })}
          </Typography>
        )}
      </Stack>
    );
  }
  if (entry.action === 'CREATO') {
    return <Typography sx={{ color: '#3b82f6', fontSize: '0.8125rem' }}>Nuova prenotazione</Typography>;
  }
  if (entry.action === 'ANNULLATO') {
    return <Typography sx={{ color: '#ef4444', fontSize: '0.8125rem' }}>Prenotazione annullata</Typography>;
  }
  if (entry.action === 'COMPLETATO') {
    return <Typography sx={{ color: '#10b981', fontSize: '0.8125rem' }}>Prenotazione completata</Typography>;
  }
  return null;
}

export default function BookingHistoryCard({ entry, onClick }: BookingHistoryCardProps) {
  const theme = useTheme();
  const cfg = ACTION_CONFIG[entry.action];
  const customer = entry.booking?.customer;
  const artist = entry.booking?.artist;
  const details = renderDetails(entry);

  return (
    <Box
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: 'rgba(26, 35, 50, 0.6)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          backgroundColor: 'rgba(26, 35, 50, 0.8)',
          borderColor: theme.palette.primary.main,
          transform: 'translateY(-2px)',
        } : {},
      }}
    >
      {/* Header: data + action chip */}
      <Stack
        direction="row"
        useFlexGap
        sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}
      >
        <Stack direction="row" useFlexGap sx={{ alignItems: 'center', gap: 0.75, minWidth: 0 }}>
          <CalendarDays size={14} style={{ color: theme.palette.primary.main, flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.8125rem', color: theme.palette.text.primary, fontWeight: 500 }}>
            {format(new Date(entry.changedAt), 'dd MMM yyyy HH:mm', { locale: it })}
          </Typography>
        </Stack>
        <Chip
          label={cfg?.label ?? entry.action}
          size="small"
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            height: 22,
            backgroundColor: cfg?.bg,
            color: cfg?.color,
          }}
        />
      </Stack>

      {/* Cliente + artista */}
      <Box
        sx={{
          pt: 1,
          borderTop: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
        }}
      >
        {customer ? (
          <Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: theme.palette.text.primary }}>
              {customer.firstName} {customer.lastName}
            </Typography>
            {customer.phone && (
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  color: theme.palette.text.secondary,
                  fontFamily: 'monospace',
                  mt: 0.25,
                }}
              >
                {customer.phone}
              </Typography>
            )}
          </Box>
        ) : (
          <Typography sx={{ fontSize: '0.8125rem', opacity: 0.4 }}>Cliente —</Typography>
        )}

        {artist && (
          <Stack direction="row" useFlexGap sx={{ alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                flexShrink: 0,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: artist.color,
              }}
            />
            <Typography sx={{ fontSize: '0.8125rem', color: theme.palette.text.secondary }}>
              {artist.name}
            </Typography>
          </Stack>
        )}
      </Box>

      {/* Dettagli (oldDate -> newDate o messaggio) */}
      {details && (
        <Box
          sx={{
            pt: 1,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            sx={{
              fontSize: '0.6875rem',
              color: theme.palette.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              mb: 0.5,
            }}
          >
            Dettagli
          </Typography>
          {details}
        </Box>
      )}

      {/* Footer: chi ha fatto il cambio */}
      {entry.changedBy?.name && (
        <Stack
          direction="row"
          useFlexGap
          sx={{
            alignItems: 'center',
            gap: 0.75,
            pt: 1,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <User size={12} style={{ color: theme.palette.primary.main, flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
            {entry.changedBy.name}
          </Typography>
        </Stack>
      )}
    </Box>
  );
}
