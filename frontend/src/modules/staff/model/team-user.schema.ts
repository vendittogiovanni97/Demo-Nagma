import { z } from 'zod';
import { nonEmptyString, roleSchema } from '@/shared/schemas/common';

export const createUserSchema = z.object({
  name: nonEmptyString('Il nome è obbligatorio'),
  email: z.string().email('Email non valida'),
  password: z.string().min(6, 'La password deve avere almeno 6 caratteri'),
  role: roleSchema,
  phone: z.string().optional(),
  color: z.string().optional(),
});

export const createShiftSchema = z.object({
  userId: nonEmptyString('userId è obbligatorio'),
  weekStart: nonEmptyString('weekStart è obbligatorio'),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isOff: z.boolean().optional(),
  notes: z.string().optional(),
});

export const updateShiftSchema = z.object({
  weekStart: z.string().optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isOff: z.boolean().optional(),
  notes: z.string().optional(),
});
