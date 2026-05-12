import { z } from 'zod';

export const createCreamSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const createCreamSaleSchema = z.object({
  creamId: z.number().int().positive(),
  artistId: z.number().int().positive(),
  quantity: z.number().int().positive().min(1).default(1),
});

export type CreateCreamInput = z.infer<typeof createCreamSchema>;
export type CreateCreamSaleInput = z.infer<typeof createCreamSaleSchema>;
