import { z } from 'zod';

const isoDay = z.iso.date();

export const artistRevenueQuerySchema = z
  .object({
    mode: z.enum(['day', 'month', 'year', 'custom']).optional(),
    year: z.coerce.number().int().min(2000).max(2100).optional(),
    month: z.coerce.number().int().min(1).max(12).optional(),
    day: isoDay.optional(),
    startDate: isoDay.optional(),
    endDate: isoDay.optional(),
  })
  .refine((q) => q.mode !== 'custom' || (q.startDate && q.endDate && q.startDate <= q.endDate), {
    message: 'Per il periodo personalizzato servono startDate ed endDate, con startDate non successiva a endDate',
    path: ['startDate'],
  });
