import { z } from 'zod';

export const createWhatsAppTemplateSchema = z.object({
  name: z.string().min(1),
  body: z.string().min(1),
  category: z.string().optional(),
});

export const updateWhatsAppTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  category: z.string().optional(),
});

export const sendWhatsAppMessageSchema = z.object({
  templateId: z.number().int().positive().optional(),
  bookingId: z.number().int().positive().optional(),
  customerId: z.number().int().positive().optional(),
  recipientName: z.string().trim().optional(),
  recipientPhone: z.string().trim().min(1, 'Numero di telefono obbligatorio'),
  message: z.string().trim().optional(),
  variables: z.record(z.string(), z.string()).default({}),
});

export const listWhatsAppLogsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  templateId: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const sendBirthdayGreetingsSchema = z.object({
  customerId: z.coerce.number().int().positive().optional(),
  resend: z.boolean().optional(),
});
