export function extractErrorMessage(error: unknown, fallback = 'Errore inatteso'): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return fallback;
}
