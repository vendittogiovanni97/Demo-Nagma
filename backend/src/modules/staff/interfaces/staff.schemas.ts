import { z } from 'zod';
import { StaffType } from '@prisma/client';

import { nonEmptyString } from '../../../shared/utils/common.schemas';

export const createStaffSchema = z.object({
  name:  nonEmptyString('Il nome è obbligatorio'),
  type:  z.nativeEnum(StaffType),
  color: nonEmptyString('Il colore è obbligatorio'),
});

export const updateStaffSchema = createStaffSchema.partial();

export const createShiftSchema = z.object({
  staffId: z.number().int().positive(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  label: z.string().optional(),
});

export const updateShiftSchema = createShiftSchema.partial();

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'La password deve essere di almeno 6 caratteri'),
});
