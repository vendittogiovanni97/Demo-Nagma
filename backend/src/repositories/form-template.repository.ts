import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';

export class FormTemplateRepository {
  async findAll() {
    return prisma.formTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.formTemplate.findUnique({ where: { id } });
  }

  async create(data: Prisma.FormTemplateCreateInput) {
    return prisma.formTemplate.create({ data });
  }

  async update(id: string, data: Prisma.FormTemplateUpdateInput) {
    return prisma.formTemplate.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.formTemplate.delete({ where: { id } });
  }
}
