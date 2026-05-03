import { PrismaClient, Prisma } from '@prisma/client';
import { IFormTemplateRepository, FormTemplateFilters } from '../contracts/IFormTemplateRepository';
import { FormTemplate } from '../domain/FormTemplate';
import prismaClient from '../../../shared/utils/prisma';

export class PrismaFormTemplateRepository implements IFormTemplateRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prismaClient;
  }

  private mapToDomain(raw: any): FormTemplate {
    return new FormTemplate({
      id: raw.id,
      name: raw.name,
      schemaB64: raw.schemaB64,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findAll(filters: FormTemplateFilters): Promise<FormTemplate[]> {
    const { startDate, endDate } = filters;
    const where: Prisma.FormTemplateWhereInput = {};

    if (startDate) {
      where.createdAt = { gte: new Date(startDate) };
    }
    if (endDate) {
      const existing = where.createdAt as Prisma.DateTimeFilter | undefined;
      where.createdAt = { 
        ...existing, 
        lte: new Date(endDate + 'T23:59:59.999') 
      };
    }

    const raws = await this.prisma.formTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return raws.map(this.mapToDomain);
  }

  async findById(id: number): Promise<FormTemplate | null> {
    const raw = await this.prisma.formTemplate.findFirst({
      where: { id },
    });
    return raw ? this.mapToDomain(raw) : null;
  }

  async create(template: FormTemplate): Promise<FormTemplate> {
    const data = template.toJSON();
    const created = await this.prisma.formTemplate.create({
      data: {
        name: data.name,
        schemaB64: data.schemaB64,
      },
    });
    return this.mapToDomain(created);
  }

  async update(id: number, data: Partial<FormTemplate>): Promise<FormTemplate> {
    const updated = await this.prisma.formTemplate.update({
      where: { id },
      data: data as any,
    });
    return this.mapToDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.formTemplate.delete({
      where: { id },
    });
  }
}
