import { Prisma } from '@prisma/client';

export interface Template extends Prisma.TemplateGetPayload<{}> {}

// Example of additional type definitions that might be needed
export interface TemplateCreateInput extends Prisma.TemplateCreateInput {}
export interface TemplateUpdateInput extends Prisma.TemplateUpdateInput {}
export interface TemplateWhereInput extends Prisma.TemplateWhereInput {}