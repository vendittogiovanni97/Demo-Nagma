export type BookingBadgeVariant =
  | 'status-confirmed'
  | 'status-completed'
  | 'status-cancelled'
  | 'status-rescheduled'
  | 'secondary';

export const BOOKING_STATUS_CONFIG: Record<
  string,
  { label: string; badgeVariant: BookingBadgeVariant; color?: string }
> = {
  CONFERMATO: {
    label: 'Confermato',
    badgeVariant: 'status-confirmed',
    color: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  },
  ANNULLATO: {
    label: 'Annullato',
    badgeVariant: 'status-cancelled',
    color: 'bg-red-500/20 text-red-300 border border-red-500/30',
  },
  SPOSTATO: {
    label: 'Rimandato',
    badgeVariant: 'status-rescheduled',
    color: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  },
  COMPLETATO: {
    label: 'Completato',
    badgeVariant: 'status-completed',
    color: 'bg-green-500/20 text-green-300 border border-green-500/30',
  },
};

export function getBookingStatusLabel(status: string): string {
  return BOOKING_STATUS_CONFIG[status]?.label ?? status;
}

/** @deprecated use getBookingStatusBadgeVariant for proper BadgeVariant typing */
export function getBookingStatusVariant(status: string): string {
  return BOOKING_STATUS_CONFIG[status]?.badgeVariant ?? 'secondary';
}

export function getBookingStatusBadgeVariant(status: string): BookingBadgeVariant {
  return BOOKING_STATUS_CONFIG[status]?.badgeVariant ?? 'secondary';
}
