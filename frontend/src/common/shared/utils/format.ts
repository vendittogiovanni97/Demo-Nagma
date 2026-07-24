import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export function formatPrice(value: number, decimals = 2): string {
  return `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatDate(
  date: string | Date | null | undefined,
  fmt = 'd MMM yyyy',
  fallback = '—'
): string {
  if (date == null) return fallback;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return fallback;
  return format(d, fmt, { locale: it });
}
