import { z } from 'zod';

export const createStaffSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['ARTIST', 'USER', 'ADMIN']),
  phone: z.string().optional(),
  color: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  password: z.string().min(6),
});

export const updateStaffSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['ARTIST', 'USER', 'ADMIN']).optional(),
  phone: z.string().optional(),
  color: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
});

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
