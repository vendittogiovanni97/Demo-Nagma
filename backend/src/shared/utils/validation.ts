import { z } from 'zod';
import { AppError } from '../errors/AppError';

/** Valida il payload contro lo schema e lancia AppError(400) se non valido */
export function validate<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    const message = details.map((issue) => issue.message).join(', ');
    throw new AppError(message, 400, 'VALIDATION_ERROR', details);
  }
  return result.data;
}
