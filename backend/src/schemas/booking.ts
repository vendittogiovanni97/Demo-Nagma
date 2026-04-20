import { z } from 'zod';

import { bookingStatusSchema, nonEmptyString } from './common';

export const createBookingSchema = z.object({
  customerId: z.coerce.number().int().positive('customerId non valido'),
  artistId: z.coerce.number().int().positive('artistId non valido'),
  date: nonEmptyString('La data è obbligatoria'),
  duration: z.number().int().min(30).max(480).default(120).optional(),
  price: z.number().positive().optional(),
  deposit: z.number().positive().optional(),
  notes: z.string().optional(),
  formData: z.record(z.string(), z.unknown()).optional(),
});

export const verifyPasswordSchema = z.object({
  password: z.string().min(1, 'Password obbligatoria'),
});

export const updateBookingSchema = z.object({
  artistId: z.coerce.number().int().positive('artistId non valido').optional(),
  customerId: z.coerce.number().int().positive('customerId non valido').optional(),
  status: bookingStatusSchema.optional(),
  date: z.string().optional(),
  duration: z.number().int().min(30).max(480).optional(),
  price: z.number().positive().optional(),
  deposit: z.number().positive().optional(),
  notes: z.string().optional(),
  formData: z.record(z.string(), z.unknown()).optional(),
});
