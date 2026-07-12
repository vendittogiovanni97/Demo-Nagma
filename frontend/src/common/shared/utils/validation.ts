import type { z } from 'zod';

/**
 * Valida dati contro uno schema Zod e ritorna il primo messaggio d'errore o null se valido.
 */
export function validateData<T>(schema: z.ZodType<T>, data: unknown): string | null {
  try {
    const result = schema.safeParse(data);
    if (result.success) return null;
    return result.error?.issues[0]?.message || 'Dati non validi';
  } catch {
    return 'Dati non validi';
  }
}
