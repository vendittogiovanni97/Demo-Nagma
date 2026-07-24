import type { BookingStatus } from '@/common/shared/types/enums';
import { isSameDay } from 'date-fns';

const OPERATIONAL_STATUSES: ReadonlySet<BookingStatus> = new Set(['CREATO', 'CONFERMATO']);
const ARRIVAL_GRACE_PERIOD_MS = 10 * 60 * 1000;

interface AgendaBooking {
  date: string;
  status: BookingStatus;
}

export function getOperationalTodayBookings<T extends AgendaBooking>(
  bookings: readonly T[] | undefined,
  today = new Date(),
): T[] {
  if (!bookings?.length) return [];

  const oldestVisibleTime = today.getTime() - ARRIVAL_GRACE_PERIOD_MS;

  return bookings
    .filter(
      (booking) => {
        const bookingDate = new Date(booking.date);
        return (
          OPERATIONAL_STATUSES.has(booking.status) &&
          isSameDay(bookingDate, today) &&
          bookingDate.getTime() >= oldestVisibleTime
        );
      },
    )
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());
}
