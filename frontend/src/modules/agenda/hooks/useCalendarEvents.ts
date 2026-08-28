"use client";

import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';

import type { Booking } from '@/modules/booking/model/booking.types';
import { DEFAULT_ARTIST_COLOR } from '@/common/theme/colorTokens';

interface ArtistOption {
  value: string;
  label: string;
}

interface CalendarEventsResult {
  events: ReturnType<typeof buildEvents>;
  artistOptions: ArtistOption[];
}

function buildEvents(bookings: Booking[], textColor: string) {
  return bookings.map((booking) => ({
    id: booking.id.toString(),
    start: booking.date,
    end: new Date(
      new Date(booking.date).getTime() + (booking.duration ?? 60) * 60000
    ).toISOString(),
    extendedProps: { booking },
    backgroundColor: `${booking.artist?.color ?? DEFAULT_ARTIST_COLOR}15`,
    borderColor: booking.artist?.color ?? DEFAULT_ARTIST_COLOR,
    textColor,
  }));
}

export function useCalendarEvents(bookings: Booking[] | undefined): CalendarEventsResult {
  const theme = useTheme();
  const events = useMemo(() => buildEvents(bookings ?? [], theme.palette.common.white), [bookings, theme]);

  const artistOptions = useMemo<ArtistOption[]>(() => {
    const seen = new Set<number>();
    const opts: ArtistOption[] = [{ value: '', label: 'Tutti gli artisti' }];
    (bookings ?? []).forEach((b) => {
      if (b.artist && !seen.has(b.artistId)) {
        seen.add(b.artistId);
        opts.push({ value: b.artistId.toString(), label: b.artist.name });
      }
    });
    return opts;
  }, [bookings]);

  return { events, artistOptions };
}
