"use client";

import { Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

import type { BookingHistoryEntry } from '@/modules/booking-history/api/booking-history.api';

interface BookingHistoryDateDetailsProps {
  entry: BookingHistoryEntry;
  fontSize?: string;
}

const formatBookingDate = (date: string) =>
  format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: it });

export default function BookingHistoryDateDetails({
  entry,
  fontSize = '0.875rem',
}: BookingHistoryDateDetailsProps) {
  const currentDate = entry.newDate ?? entry.oldDate ?? entry.booking?.date;

  if (entry.action === 'SPOSTATO') {
    return (
      <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        {entry.oldDate && (
          <Typography sx={{ color: 'error.main', textDecoration: 'line-through', fontSize }}>
            {formatBookingDate(entry.oldDate)}
          </Typography>
        )}
        {entry.oldDate && entry.newDate && (
          <Typography sx={{ color: 'text.secondary', fontSize }}>→</Typography>
        )}
        {entry.newDate && (
          <Typography sx={{ color: 'success.main', fontSize }}>
            {formatBookingDate(entry.newDate)}
          </Typography>
        )}
      </Stack>
    );
  }

  if (entry.action === 'ANNULLATO' || entry.action === 'CANCELLATO') {
    return currentDate ? (
      <Typography sx={{ color: 'error.main', textDecoration: 'line-through', fontSize }}>
        {formatBookingDate(currentDate)}
      </Typography>
    ) : null;
  }

  if (entry.action === 'MODIFICATO' || entry.action === 'COMPLETATO') {
    return currentDate ? (
      <Typography sx={{ color: 'text.primary', fontSize }}>
        {formatBookingDate(currentDate)}
      </Typography>
    ) : null;
  }

  if (entry.oldDate || entry.newDate) {
    return (
      <Typography sx={{ color: 'text.primary', fontSize }}>
        {formatBookingDate(currentDate!)}
      </Typography>
    );
  }

  if (entry.action === 'CREATO') {
    return <Typography sx={{ color: 'info.main', fontSize }}>Nuova prenotazione</Typography>;
  }

  return <Typography sx={{ fontSize }}>—</Typography>;
}
