/**
 * Calcola il lunedì della settimana per una data data.
 * @param date Data di riferimento
 * @returns Data del lunedì a mezzanotte UTC
 */
export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // day: 0=Dom, 1=Lun, ..., 6=Sab
  // Vogliamo che Lunedì sia il primo giorno (diff=0)
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
