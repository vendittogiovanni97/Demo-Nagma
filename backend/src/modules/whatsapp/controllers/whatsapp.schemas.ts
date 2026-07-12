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
  templateId: z.number(),
  to: z.string().min(1, 'Numero di telefono obbligatorio'),
  variables: z.record(z.string(), z.string()).optional(),
});

export const listWhatsAppLogsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  templateId: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
