import { z } from 'zod';
import { nonEmptyString, roleSchema } from '@/common/shared/schemas/common';

export const loginSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(6, 'La password deve avere almeno 6 caratteri'),
});

export const registerSchema = z.object({
  name: nonEmptyString('Il nome è obbligatorio'),
  email: z.string().email('Email non valida'),
  password: z.string().min(6, 'La password deve avere almeno 6 caratteri'),
  role: roleSchema.optional(),
});
