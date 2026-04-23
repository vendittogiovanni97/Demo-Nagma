import { z } from 'zod';

export const bookingHistoryQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  action: z.enum(['CREATED', 'UPDATED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED']).optional(),
  userId: z.coerce.number().optional(),
});

export type BookingHistoryQuery = z.infer<typeof bookingHistoryQuerySchema>;