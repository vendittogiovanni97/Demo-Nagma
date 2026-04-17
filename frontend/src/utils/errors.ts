/**
 * Estrae il messaggio di errore da un valore sconosciuto.
 * Gestisce Error objects, stringhe, e fallback value.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return fallback;
}
