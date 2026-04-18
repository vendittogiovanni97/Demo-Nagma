import { Prisma, FormTemplate } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import prisma from '../utils/prisma';

export class FormTemplateRepository extends BaseRepository<FormTemplate, Prisma.FormTemplateCreateInput, Prisma.FormTemplateUpdateInput> {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient);
  }

  async create(data: Prisma.FormTemplateCreateInput): Promise<FormTemplate> {
    return this.prisma.formTemplate.create({ data });
  }

  async findById(id: string | number): Promise<FormTemplate | null> {
    const templateId = typeof id === 'number' ? id : parseInt(id, 10);
    return this.prisma.formTemplate.findUnique({ where: { id: templateId } });
  }

  async findAll(): Promise<FormTemplate[]> {
    return this.prisma.formTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string | number, data: Prisma.FormTemplateUpdateInput): Promise<FormTemplate> {
    const templateId = typeof id === 'number' ? id : parseInt(id, 10);
    return this.prisma.formTemplate.update({ where: { id: templateId }, data });
  }

  async delete(id: string | number): Promise<void> {
    const templateId = typeof id === 'number' ? id : parseInt(id, 10);
    await this.prisma.formTemplate.delete({ where: { id: templateId } });
  }
}
