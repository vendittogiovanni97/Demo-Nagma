import { z } from 'zod';

export interface UserPreferencesDto {
  language: string;
  timezone: string;
  dateFormat: string;
  itemsPerPage: number;
  emailNotifications: boolean;
  inAppNotifications: boolean;
}

export const updateUserPreferencesSchema = z.object({
  language: z.enum(['it', 'en']).optional(),
  timezone: z.string().optional(),
  dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).optional(),
  itemsPerPage: z.number().int().min(5).max(100).optional(),
  emailNotifications: z.boolean().optional(),
  inAppNotifications: z.boolean().optional(),
});

export type UpdateUserPreferencesDto = z.infer<typeof updateUserPreferencesSchema>;
