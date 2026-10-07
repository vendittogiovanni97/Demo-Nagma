import { AppError } from '../errors/AppError';

/**
 * Calcola il lunedì della settimana per una data data.
 * @param date Data di riferimento
 * @returns Data del lunedì a mezzanotte UTC
 */
export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);

  const monday = new Date(d.setDate(diff));
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}

/**
 * Converte una stringa "YYYY-MM-DD" in un oggetto Date a mezzanotte UTC.
 */
export function parseUTCDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Calcola l'intervallo di date per un mese specifico.
 * @param monthStr Stringa "YYYY-MM"
 * @returns Oggetto con start (primo del mese) e end (primo del mese successivo)
 */
export function getMonthRange(monthStr: string): { gte: Date; lt: Date } {
  if (!/^\d{4}-\d{2}$/.test(monthStr)) {
    throw new AppError('Formato mese non valido (atteso YYYY-MM)', 400, 'INVALID_MONTH');
  }
  const start = new Date(`${monthStr}-01T00:00:00.000Z`);
  if (Number.isNaN(start.getTime())) {
    throw new AppError('Mese non valido', 400, 'INVALID_MONTH');
  }
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return { gte: start, lt: end };
}

/**
 * Intervallo di date per i filtri elenco.
 *
 * Un intervallo esplicito sostituisce il mese invece di sommarsi ad esso:
 * combinarli restringeva i risultati al solo mese selezionato, svuotando la
 * lista quando le due condizioni non si sovrapponevano.
 *
 * @returns L'intervallo, oppure undefined quando non c'e' alcun filtro data.
 */
export function buildDateFilter(
  month?: string,
  startDate?: string,
  endDate?: string,
): { gte?: Date; lt?: Date; lte?: Date } | undefined {
  if (startDate || endDate) {
    const bounds: { gte?: Date; lte?: Date } = {};
    if (startDate) bounds.gte = new Date(startDate);
    if (endDate) bounds.lte = new Date(`${endDate}T23:59:59.999`);
    return bounds;
  }
  if (month) return getMonthRange(month);
  return undefined;
}

/**
 * Estrae e converte i parametri di paginazione/ricerca dalla query string.
 */
export function parsePageQuery(query: Record<string, unknown>) {
  const toInt = (value: unknown, fallback: number): number => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.trunc(n) : fallback;
  };
  return {
    page: query.page ? Math.max(1, toInt(query.page, 1)) : 1,
    limit: query.limit ? Math.min(100, Math.max(1, toInt(query.limit, 25))) : 25,
    search: (query.search as string | undefined)?.trim(),
    month: query.month as string | undefined,
    startDate: query.startDate as string | undefined,
    endDate: query.endDate as string | undefined,
  };
}

export const STUDIO_TIME_ZONE = 'Europe/Rome';

function zoneOffsetMs(instant: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(new Date(instant));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return asUtc - Math.floor(instant / 1000) * 1000;
}

/**
 * Istante UTC della mezzanotte locale del giorno indicato. Giorni e mesi fuori
 * intervallo vengono normalizzati (es. giorno 32 → primo del mese successivo).
 * L'offset viene ricalcolato sull'istante trovato per gestire i cambi d'ora.
 */
export function zonedDayStart(year: number, month: number, day: number, timeZone = STUDIO_TIME_ZONE): Date {
  const wallClock = Date.UTC(year, month - 1, day);
  const firstGuess = wallClock - zoneOffsetMs(wallClock, timeZone);
  return new Date(wallClock - zoneOffsetMs(firstGuess, timeZone));
}

/** Data odierna "YYYY-MM-DD" nel fuso dello studio. */
export function todayInZone(timeZone = STUDIO_TIME_ZONE, now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/** Ora corrente (0-23) nel fuso dello studio. */
export function hourInZone(timeZone = STUDIO_TIME_ZONE, now = new Date()): number {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone, hour: '2-digit', hourCycle: 'h23' }).format(now));
}
