import { z } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * Schemi di validazione per i filtri di export
 */
export const dateRangeFilterSchema = z.object({
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

export const weekdayFilterSchema = z.object({
  weekday: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']).optional(),
});

export const statusFilterSchema = z.object({
  status: z.enum(['CONFIRMED', 'CANCELLED', 'RESCHEDULED', 'COMPLETED']).optional(),
});

export const exportFiltersSchema = z.object({
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  weekday: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']).optional(),
  status: z.enum(['CONFIRMED', 'CANCELLED', 'RESCHEDULED', 'COMPLETED']).optional(),
  artistId: z.string().optional(),
  customerId: z.string().optional(),
});

export type ExportFilters = z.infer<typeof exportFiltersSchema>;

/**
 * Converte i filter string dal query in filtri tipizzati
 */
export function parseExportFilters(query: Record<string, any>): ExportFilters {
  const parsed = exportFiltersSchema.parse(query);
  return parsed;
}

/**
 * Costruisce il where clause per Prisma basato sui filtri
 */
export function buildWhereClause(filters: ExportFilters): Prisma.BookingWhereInput {
  const where: Prisma.BookingWhereInput = {
    deletedAt: null, // Escludere soft-deleted
  };

  // Filtro data inizio
  if (filters.fromDate) {
    where.date = { ...(where.date as any || {}), gte: new Date(filters.fromDate) };
  }

  // Filtro data fine
  if (filters.toDate) {
    const toDate = new Date(filters.toDate);
    // Aggiunge 1 giorno per includere l'intera giornata finale
    toDate.setDate(toDate.getDate() + 1);
    where.date = { ...(where.date as any || {}), lt: toDate };
  }

  // Filtro stato
  if (filters.status) {
    where.status = filters.status;
  }

  // Filtro artista
  if (filters.artistId) {
    const artistId = parseInt(filters.artistId, 10);
    if (!isNaN(artistId)) {
      where.artistId = artistId;
    }
  }

  // Filtro cliente
  if (filters.customerId) {
    const customerId = parseInt(filters.customerId, 10);
    if (!isNaN(customerId)) {
      where.customerId = customerId;
    }
  }

  return where;
}

/**
 * Filtra un array di bookings per weekday
 * (Questo si fa in memoria perche Prisma non ha supporto nativo per day-of-week su tutte le DB)
 */
export function filterByWeekday<T extends { date: Date | string }>(
  items: T[],
  weekday: string | undefined
): T[] {
  if (!weekday) return items;

  const weekdayMap: Record<string, number> = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };

  const targetDay = weekdayMap[weekday];
  if (targetDay === undefined) return items;

  return items.filter((item) => {
    const date = typeof item.date === 'string' ? new Date(item.date) : item.date;
    return date.getUTCDay() === targetDay;
  });
}

/**
 * Crea una label descrittiva dei filtri applicati
 */
export function buildFiltersLabel(filters: ExportFilters): string {
  const parts: string[] = [];

  if (filters.fromDate || filters.toDate) {
    const from = filters.fromDate ? new Date(filters.fromDate).toLocaleDateString('it-IT') : 'inizio';
    const to = filters.toDate ? new Date(filters.toDate).toLocaleDateString('it-IT') : 'fine';
    parts.push(`Dal ${from} al ${to}`);
  }

  if (filters.weekday) {
    const weekdayNames: Record<string, string> = {
      MONDAY: 'Lunedi',
      TUESDAY: 'Martedi',
      WEDNESDAY: 'Mercoledi',
      THURSDAY: 'Giovedi',
      FRIDAY: 'Venerdi',
      SATURDAY: 'Sabato',
      SUNDAY: 'Domenica',
    };
    parts.push(`Giorno: ${weekdayNames[filters.weekday] || filters.weekday}`);
  }

  if (filters.status) {
    parts.push(`Stato: ${filters.status}`);
  }

  if (filters.artistId) {
    parts.push(`Artista ID: ${filters.artistId}`);
  }

  if (filters.customerId) {
    parts.push(`Cliente ID: ${filters.customerId}`);
  }

  return parts.length > 0 ? parts.join(' | ') : 'Esportazione dati filtrati';
}
