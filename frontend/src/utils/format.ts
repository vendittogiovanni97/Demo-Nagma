import { format } from 'date-fns';
import { it } from 'date-fns/locale';

// Prezzi: "€ 1.234,56"
export function formatPrice(value: number, decimals = 2): string {
  return `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

// Durata in minuti: "1h 30m" oppure "45m"
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// Data in formato italiano: "12 apr 2026"
export function formatDate(date: string | Date, fmt = 'd MMM yyyy'): string {
  return format(new Date(date), fmt, { locale: it });
}
