import { z } from 'zod';
import { AppError } from '../utils/AppError';

export * from './booking';
export * from './common';
export * from './customer';
export * from './form-template';
export * from './transaction';
export * from './staff';
export * from './user';
export * from './whatsapp';
export * from './spesa-libera';

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
