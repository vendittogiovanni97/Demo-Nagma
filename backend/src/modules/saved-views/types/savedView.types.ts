import { z } from 'zod';

export type FilterOperator =
  | 'equals'
  | 'contains'
  | 'startsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'inRange'
  | 'isEmpty';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: unknown;
  logic?: 'AND' | 'OR';
}

export interface SavedViewDto {
  id: number;
  userId: number;
  module: string;
  name: string;
  filters: FilterCondition[];
  columns?: string[];
  sort?: { field: string; direction: 'asc' | 'desc' };
  isDefault: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const createSavedViewSchema = z.object({
  module: z.string().min(1),
  name: z.string().min(1).max(100),
  filters: z.array(
    z.object({
      field: z.string(),
      operator: z.enum(['equals', 'contains', 'startsWith', 'greaterThan', 'lessThan', 'inRange', 'isEmpty']),
      value: z.any().optional(),
      logic: z.enum(['AND', 'OR']).optional(),
    })
  ),
  columns: z.array(z.string()).optional(),
  sort: z.object({ field: z.string(), direction: z.enum(['asc', 'desc']) }).optional(),
  isDefault: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

export const updateSavedViewSchema = createSavedViewSchema.partial();

export type CreateSavedViewDto = z.infer<typeof createSavedViewSchema>;
export type UpdateSavedViewDto = z.infer<typeof updateSavedViewSchema>;
