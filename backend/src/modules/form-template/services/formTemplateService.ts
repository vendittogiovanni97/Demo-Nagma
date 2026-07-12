import { Prisma } from '@prisma/client';
import prisma from '../../../core/shared/utils/prisma';
import { AppError } from '../../../core/shared/errors/AppError';

export interface FormTemplateData {
  id: number;
  name: string;
  schemaB64: string;
  createdAt: Date;
  updatedAt: Date;
}

function mapToData(raw: any): FormTemplateData {
  return { id: raw.id, name: raw.name, schemaB64: raw.schemaB64, createdAt: raw.createdAt, updatedAt: raw.updatedAt };
}

export class FormTemplateService {
  async findAll(filters: { startDate?: string; endDate?: string }): Promise<FormTemplateData[]> {
    const where: Prisma.FormTemplateWhereInput = { deletedAt: null };
    if (filters.startDate) where.createdAt = { ...(where.createdAt as any), gte: new Date(filters.startDate) };
    if (filters.endDate) where.createdAt = { ...(where.createdAt as any), lte: new Date(filters.endDate + 'T23:59:59.999') };
    const raws = await prisma.formTemplate.findMany({ where, orderBy: { createdAt: 'desc' } });
    return raws.map(mapToData);
  }

  async findById(id: number): Promise<FormTemplateData | null> {
    const raw = await prisma.formTemplate.findFirst({ where: { id, deletedAt: null } });
    return raw ? mapToData(raw) : null;
  }

  async create(data: { name: string; schemaB64: string }): Promise<FormTemplateData> {
    const raw = await prisma.formTemplate.create({ data: { name: data.name, schemaB64: data.schemaB64 } });
    return mapToData(raw);
  }

  async update(id: number, data: Partial<FormTemplateData>): Promise<FormTemplateData> {
    const existing = await prisma.formTemplate.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new AppError('Template non trovato', 404, 'NOT_FOUND');
    const raw = await prisma.formTemplate.update({ where: { id }, data: data as any });
    return mapToData(raw);
  }

  async delete(id: number): Promise<void> {
    await prisma.formTemplate.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
