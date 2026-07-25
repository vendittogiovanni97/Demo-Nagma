export const BOOKING_LIST_CACHE_KEY = 'bookings:list';
export const BOOKING_DETAIL_CACHE_KEY = 'bookings:detail';
export const BOOKING_STATS_CACHE_KEY = 'bookings:stats';

export function isBookingCacheKey(key: unknown): boolean {
  return (
    Array.isArray(key) &&
    typeof key[0] === 'string' &&
    key[0].startsWith('bookings:')
  );
}
