import prisma from '../../../core/shared/utils/prisma';
import { CreateSavedViewDto, UpdateSavedViewDto, SavedViewDto } from '../types/savedView.types';
import { AppError } from '../../../core/shared/errors/AppError';

export class SavedViewService {
  async getSavedViews(userId: number, module: string): Promise<SavedViewDto[]> {
    const views = await prisma.savedView.findMany({
      where: {
        module,
        OR: [{ userId }, { isPublic: true }],
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });

    return views as any;
  }

  async createSavedView(userId: number, data: CreateSavedViewDto): Promise<SavedViewDto> {
    if (data.isDefault) {
      await prisma.savedView.updateMany({
        where: { userId, module: data.module },
        data: { isDefault: false },
      });
    }

    const created = await prisma.savedView.create({
      data: {
        userId,
        module: data.module,
        name: data.name,
        filters: data.filters as any,
        columns: data.columns as any,
        sort: data.sort as any,
        isDefault: data.isDefault ?? false,
        isPublic: data.isPublic ?? false,
      },
    });

    return created as any;
  }

  async updateSavedView(userId: number, id: number, data: UpdateSavedViewDto): Promise<SavedViewDto> {
    const existing = await prisma.savedView.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      throw new AppError('Vista salvata non trovata o permessi insufficienti', 404, 'NOT_FOUND');
    }

    if (data.isDefault && existing.module) {
      await prisma.savedView.updateMany({
        where: { userId, module: existing.module },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.savedView.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.filters && { filters: data.filters as any }),
        ...(data.columns !== undefined && { columns: data.columns as any }),
        ...(data.sort !== undefined && { sort: data.sort as any }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
      },
    });

    return updated as any;
  }

  async deleteSavedView(userId: number, id: number): Promise<void> {
    const existing = await prisma.savedView.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      throw new AppError('Vista salvata non trovata o permessi insufficienti', 404, 'NOT_FOUND');
    }

    await prisma.savedView.delete({ where: { id } });
  }

  async setDefault(userId: number, id: number): Promise<SavedViewDto> {
    const existing = await prisma.savedView.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      throw new AppError('Vista salvata non trovata o permessi insufficienti', 404, 'NOT_FOUND');
    }

    await prisma.savedView.updateMany({
      where: { userId, module: existing.module },
      data: { isDefault: false },
    });

    const updated = await prisma.savedView.update({
      where: { id },
      data: { isDefault: true },
    });

    return updated as any;
  }
}
