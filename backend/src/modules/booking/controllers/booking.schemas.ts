import { z } from 'zod';

import { bookingStatusSchema, nonEmptyString } from '../../../core/shared/utils/common.schemas';

export const createBookingSchema = z.object({
  customerId: z.coerce.number().int().min(1).max(999999, 'customerId non valido'),
  artistId: z.coerce.number().int().min(1).max(999999, 'artistId non valido'),
  date: nonEmptyString('La data è obbligatoria'),
  duration: z.number().int().min(30).max(480).default(120).optional(),
  price: z.number().min(0, 'Il prezzo non può essere negativo').optional(),
  deposit: z.number().min(0, 'L\'acconto non può essere negativo').optional(),
  notes: z.string().optional(),
  type: z.string().optional(),
  formData: z.record(z.string(), z.unknown()).optional(),
}).passthrough();

export const verifyPasswordSchema = z.object({
  password: z.string().min(1, 'Password obbligatoria'),
});

export const kanbanStageValues = ['IN_ARRIVO', 'IN_ATTESA', 'IN_SEDUTA', 'DA_SALDARE', 'SALDATO'] as const;
export const kanbanStageSchema = z.object({
  stage: z.enum(kanbanStageValues, { message: 'Stato kanban non valido' }),
});

export const updateBookingSchema = z.object({
  artistId: z.coerce.number().int().min(1).max(999999, 'artistId non valido').optional(),
  customerId: z.coerce.number().int().min(1).max(999999, 'customerId non valido').optional(),
  status: bookingStatusSchema.optional(),
  date: z.string().optional(),
  duration: z.number().int().min(30).max(480).optional(),
  price: z.number().min(0, 'Il prezzo non può essere negativo').optional(),
  deposit: z.number().min(0, 'L\'acconto non può essere negativo').optional(),
  notes: z.string().optional(),
  type: z.string().optional(),
  formData: z.record(z.string(), z.unknown()).optional(),
}).passthrough();
