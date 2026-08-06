import { z } from 'zod';

const staffTypeSchema = z.enum(['COLLABORATORE', 'APPRENDISTA']);

export const createStaffSchema = z.object({
  name: z.string().trim().min(1),
  type: staffTypeSchema,
  color: z.string().trim().min(1).optional(),
  isRentPayee: z.boolean().optional(),
});

export const updateStaffSchema = z.object({
  name: z.string().trim().min(1).optional(),
  type: staffTypeSchema.optional(),
  color: z.string().trim().min(1).optional(),
  isRentPayee: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'Specificare almeno un campo da modificare',
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;

export const createShiftSchema = z.object({
  staffId: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  label: z.string().optional(),
  weekStart: z.string().optional(),
});

export const updateShiftSchema = z.object({
  staffId: z.number().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  label: z.string().optional(),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password deve essere almeno 6 caratteri'),
});
