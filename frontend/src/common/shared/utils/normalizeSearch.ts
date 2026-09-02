/**
 * Normalizza una stringa per la ricerca: minuscolo + rimozione accenti,
 * così "caffe" trova "Caffè".
 */
export function normalizeSearch(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}
