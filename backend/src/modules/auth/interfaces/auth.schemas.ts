import { z } from 'zod';

import { nonEmptyString, roleSchema } from '../../../shared/utils/common.schemas';

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

export const createUserSchema = z.object({
  name: nonEmptyString('Il nome è obbligatorio'),
  email: z.string().email('Email non valida'),
  password: z.string().min(6, 'La password deve avere almeno 6 caratteri'),
  role: roleSchema,
  phone: z.string().optional(),
  color: z.string().optional(),
});

export const createShiftSchema = z.object({
  staffId: z.coerce.number().int().positive('staffId non valido'),
  weekStart: nonEmptyString('weekStart è obbligatorio'),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  label: z.string().optional(),
  isOff: z.boolean().optional(),
  notes: z.string().optional(),
});

export const updateShiftSchema = z.object({
  weekStart: z.string().optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  label: z.string().optional(),
  isOff: z.boolean().optional(),
  notes: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: nonEmptyString('Il nome è obbligatorio'),
  email: z.string().email('Email non valida'),
  role: roleSchema,
  phone: z.string().optional(),
  color: z.string().optional(),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'La password deve avere almeno 6 caratteri'),
});

export const updateMeSchema = z.object({
  name: nonEmptyString('Il nome è obbligatorio'),
  phone: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password attuale obbligatoria'),
  newPassword: z.string().min(6, 'La password deve avere almeno 6 caratteri'),
});
