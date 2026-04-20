/**
 * Configurazione centralizzata degli stati delle prenotazioni.
 * Unica fonte di verità per label, variant Badge e classi CSS colore.
 */
export const BOOKING_STATUS_CONFIG: Record<string, { label: string; variant: string; color?: string }> = {
  CONFIRMED: {
    label: 'Confermato',
    variant: 'info',
    color: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  },
  CANCELLED: {
    label: 'Annullato',
    variant: 'danger',
    color: 'bg-red-500/20 text-red-300 border border-red-500/30',
  },
  RESCHEDULED: {
    label: 'Rimandato',
    variant: 'warning',
    color: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  },
  COMPLETED: {
    label: 'Completato',
    variant: 'success',
    color: 'bg-green-500/20 text-green-300 border border-green-500/30',
  },
};

/** Helper: restituisce la label per un dato status, con fallback sul valore grezzo */
export function getBookingStatusLabel(status: string): string {
  return BOOKING_STATUS_CONFIG[status]?.label ?? status;
}

/** Helper: restituisce il variant Badge per un dato status */
export function getBookingStatusVariant(status: string): string {
  return BOOKING_STATUS_CONFIG[status]?.variant ?? 'default';
}
