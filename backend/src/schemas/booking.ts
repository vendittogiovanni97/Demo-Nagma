import { z } from 'zod';

import { bookingStatusSchema, nonEmptyString } from './common';

export const createBookingSchema = z.object({
  customerId: nonEmptyString('customerId è obbligatorio'),
  artistId: nonEmptyString('artistId è obbligatorio'),
  date: nonEmptyString('La data è obbligatoria'),
  duration: z.number().int().positive().optional(),
  type: z.string().optional(),
  price: z.number().positive().optional(),
  deposit: z.number().positive().optional(),
  notes: z.string().optional(),
  formData: z.record(z.string(), z.unknown()).optional(),
});

export const updateBookingSchema = z.object({
  status: bookingStatusSchema.optional(),
  date: z.string().optional(),
  duration: z.number().int().positive().optional(),
  type: z.string().optional(),
  price: z.number().positive().optional(),
  deposit: z.number().positive().optional(),
  notes: z.string().optional(),
  formData: z.record(z.string(), z.unknown()).optional(),
});
