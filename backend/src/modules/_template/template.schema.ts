import { z } from 'zod';

// Template schema for validation
export const templateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  content: z.string().optional(),
  isActive: z.boolean().default(true),
  // Add other fields as needed for your specific template type
});

// Types for inferred TypeScript types
export type TemplateCreateDTO = z.infer<typeof templateSchema>;
export type TemplateUpdateDTO = z.Partial<z.infer<typeof templateSchema>>;

export default templateSchema;