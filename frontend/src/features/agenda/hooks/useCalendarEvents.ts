"use client";

import { useMemo } from 'react';

import type { Booking } from '@/types/booking';

interface ArtistOption {
  value: string;
  label: string;
}

interface CalendarEventsResult {
  events: ReturnType<typeof buildEvents>;
  artistOptions: ArtistOption[];
}

function buildEvents(bookings: Booking[]) {
  return bookings.map((booking) => ({
    id: booking.id.toString(),
    start: booking.date,
    end: new Date(
      new Date(booking.date).getTime() + (booking.duration ?? 60) * 60000
    ).toISOString(),
    extendedProps: { booking },
    backgroundColor: `${booking.artist?.color ?? '#00BFFF'}15`,
    borderColor: booking.artist?.color ?? '#00BFFF',
    textColor: '#ffffff',
  }));
}

export function useCalendarEvents(bookings: Booking[] | undefined): CalendarEventsResult {
  const events = useMemo(() => buildEvents(bookings ?? []), [bookings]);

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
