import { z } from 'zod';

export const bookingHistoryQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  action: z.enum(['CREATO', 'CONFERMATO', 'COMPLETATO', 'MODIFICATO', 'SPOSTATO', 'ANNULLATO', 'CANCELLATO']).optional(),
  userId: z.coerce.number().optional(),
});

export type BookingHistoryQuery = z.infer<typeof bookingHistoryQuerySchema>;