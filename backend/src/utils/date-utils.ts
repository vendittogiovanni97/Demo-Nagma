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
  const start = new Date(`${monthStr}-01T00:00:00.000Z`);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return { gte: start, lt: end };
}

/**
 * Estrae e converte i parametri di paginazione/ricerca dalla query string.
 */
export function parsePageQuery(query: Record<string, unknown>) {
  return {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 20,
    search: (query.search as string | undefined)?.trim(),
    month: query.month as string | undefined,
  };
}

/**
 * Crea un oggetto di risposta paginata standardizzato.
 */
export function paginate<T>(data: T[], total: number, page: number, limit: number) {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export function buildPagination(page: number, limit: number) {
  return { skip: (page - 1) * limit, take: limit };
}
