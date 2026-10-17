"use client";

import { Box, Stack, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import Badge from '@/common/components/ui/Badge';
import Icon from '@/common/components/ui/Icon';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

import type { BookingAction, BookingHistoryEntry } from '@/modules/booking-history/api/booking-history.api';
import BookingHistoryDateDetails from './BookingHistoryDateDetails';

interface BookingHistoryCardProps {
  entry: BookingHistoryEntry;
  onClick?: () => void;
}

const ACTION_CONFIG: Record<
  BookingAction,
  { label: string; variant: 'info' | 'success' | 'warning' | 'error' | 'default' }
> = {
  CREATO:     { label: 'Creato',     variant: 'info' },
  CONFERMATO: { label: 'Confermato', variant: 'success' },
  MODIFICATO: { label: 'Modificato', variant: 'warning' },
  SPOSTATO: { label: 'Spostato',   variant: 'warning' },
  ANNULLATO:   { label: 'Annullato',  variant: 'error' },
  COMPLETATO:   { label: 'Completato', variant: 'success' },
  CANCELLATO: { label: 'Cancellato', variant: 'default' },
};

export default function BookingHistoryCard({ entry, onClick }: BookingHistoryCardProps) {
  const theme = useTheme();
  const cfg = ACTION_CONFIG[entry.action];
  const customer = entry.booking?.customer;
  const artist = entry.booking?.artist;

  return (
    <Box
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.background.paper, 0.92),
        border: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
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
          <Icon name="calendarDays" size={14} color={theme.palette.primary.main} />
          <Typography sx={{ fontSize: '0.8125rem', color: theme.palette.text.primary, fontWeight: 500 }}>
            {format(new Date(entry.changedAt), 'dd MMM yyyy HH:mm', { locale: it })}
          </Typography>
        </Stack>
        <Badge
          label={cfg?.label ?? entry.action}
          size="xs"
          variant={cfg?.variant ?? 'default'}
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
                border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
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
      {(entry.oldDate || entry.newDate || entry.action === 'CREATO') && (
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
          <BookingHistoryDateDetails entry={entry} fontSize="0.8125rem" />
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
          <Icon name="user" size={12} color={theme.palette.primary.main} />
          <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
            {entry.changedBy.name}
          </Typography>
        </Stack>
      )}
    </Box>
  );
}
