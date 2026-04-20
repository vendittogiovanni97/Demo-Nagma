import { AppError } from './AppError';

export function parseId(raw: string | string[] | undefined, fieldName = 'id'): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new AppError(`Parametro '${fieldName}' non valido`, 400, 'INVALID_PARAM');
  }
  return n;
}
