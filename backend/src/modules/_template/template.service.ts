import prisma from '../../core/shared/utils/prisma';
import templateSchema, { TemplateCreateDTO, TemplateUpdateDTO } from './template.schema';

export class TemplateService {
  /**
   * Create a new template
   */
  async create(data: TemplateCreateDTO) {
    // Validate input
    const validatedData = templateSchema.parse(data);

    return await prisma.template.create({
      data: validatedData,
    });
  }

  /**
   * Find a template by ID
   */
  async findById(id: string) {
    return await prisma.template.findUnique({
      where: { id },
    });
  }

  /**
   * Find multiple templates with filtering and pagination
   */
  async find(params: {
    skip?: number;
    take?: number;
    where?: Record<string, unknown>;
    orderBy?: Record<string, 'asc' | 'desc'> | Array<Record<string, 'asc' | 'desc'>>;
  } = {}) {
    const { skip = 0, take = 20, where = {}, orderBy } = params;

    return await prisma.template.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  /**
   * Count templates matching criteria
   */
  async count(params: {
    where?: Record<string, unknown>;
  } = {}) {
    const { where = {} } = params;

    return await prisma.template.count({
      where,
    });
  }

  /**
   * Update a template
   */
  async update(id: string, data: TemplateUpdateDTO) {
    // Validate input
    const validatedData = templateSchema.partial().parse(data);

    return await prisma.template.update({
      where: { id },
      data: validatedData,
    });
  }

  /**
   * Delete a template (soft delete)
   */
  async delete(id: string) {
    return await prisma.template.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Restore a soft-deleted template
   */
  async restore(id: string) {
    return await prisma.template.update({
      where: { id },
      data: {
        deletedAt: null,
      },
    });
  }

  /**
   * Permanently delete a template (hard delete)
   */
  async deleteForever(id: string) {
    return await prisma.template.delete({
      where: { id },
    });
  }
}
