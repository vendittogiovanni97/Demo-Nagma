import type { Theme } from '@mui/material/styles';

export type BookingBadgeVariant =
  | 'status-created'
  | 'status-confirmed'
  | 'status-completed'
  | 'status-updated'
  | 'status-rescheduled'
  | 'status-cancelled'
  | 'status-deleted'
  | 'secondary';

export type BookingStatusTone =
  | 'info'
  | 'primary'
  | 'success'
  | 'warning'
  | 'purple'
  | 'secondary'
  | 'error';

export const BOOKING_STATUS_CONFIG: Record<
  string,
  { label: string; badgeVariant: BookingBadgeVariant; tone: BookingStatusTone }
> = {
  CREATO: {
    label: 'Creato',
    badgeVariant: 'status-created',
    tone: 'info',
  },
  CONFERMATO: {
    label: 'Confermato',
    badgeVariant: 'status-confirmed',
    tone: 'primary',
  },
  COMPLETATO: {
    label: 'Completato',
    badgeVariant: 'status-completed',
    tone: 'success',
  },
  MODIFICATO: {
    label: 'Modificato',
    badgeVariant: 'status-updated',
    tone: 'warning',
  },
  SPOSTATO: {
    label: 'Spostato',
    badgeVariant: 'status-rescheduled',
    tone: 'purple',
  },
  ANNULLATO: {
    label: 'Annullato',
    badgeVariant: 'status-cancelled',
    tone: 'error',
  },
  CANCELLATO: {
    label: 'Cancellato',
    badgeVariant: 'status-deleted',
    tone: 'secondary',
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

export function getBookingStatusTone(status: string): BookingStatusTone {
  return BOOKING_STATUS_CONFIG[status]?.tone ?? 'secondary';
}

export function getBookingStatusColor(theme: Theme, status: string): string {
  const tone = getBookingStatusTone(status);
  if (tone === 'purple') return theme.palette.custom.purple;
  return theme.palette[tone].main;
}
