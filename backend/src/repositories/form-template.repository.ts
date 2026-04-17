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

  async findById(id: string): Promise<FormTemplate | null> {
    return this.prisma.formTemplate.findUnique({ where: { id: parseInt(id) } });
  }

  async findAll(): Promise<FormTemplate[]> {
    return this.prisma.formTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: Prisma.FormTemplateUpdateInput): Promise<FormTemplate> {
    return this.prisma.formTemplate.update({ where: { id: parseInt(id) }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.formTemplate.delete({ where: { id: parseInt(id) } });
  }
}
