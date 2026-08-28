import prisma from '../../../core/shared/utils/prisma';
import { Prisma, SavedView } from '@prisma/client';
import { CreateSavedViewDto, UpdateSavedViewDto, SavedViewDto, FilterCondition } from '../types/savedView.types';
import { AppError } from '../../../core/shared/errors/AppError';

/** Converte l'output degli schemi Zod nel tipo InputJsonValue richiesto dalle colonne Json di Prisma. */
const toInputJson = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;

/** Converte un JsonValue letto dal DB nel tipo del DTO (le colonne Json sono scritte solo da questi endpoint). */
const fromJson = <T>(value: Prisma.JsonValue | null): T | undefined =>
  value === null ? undefined : (value as unknown as T);

function toDto(row: SavedView): SavedViewDto {
  return {
    id: row.id,
    userId: row.userId,
    module: row.module,
    name: row.name,
    filters: fromJson<FilterCondition[]>(row.filters) ?? [],
    columns: fromJson<string[]>(row.columns),
    sort: fromJson<SavedViewDto['sort']>(row.sort),
    isDefault: row.isDefault,
    isPublic: row.isPublic,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class SavedViewService {
  async getSavedViews(userId: number, module: string): Promise<SavedViewDto[]> {
    const views = await prisma.savedView.findMany({
      where: {
        module,
        OR: [{ userId }, { isPublic: true }],
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });

    return views.map(toDto);
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
        filters: toInputJson(data.filters),
        ...(data.columns !== undefined && { columns: toInputJson(data.columns) }),
        ...(data.sort !== undefined && { sort: toInputJson(data.sort) }),
        isDefault: data.isDefault ?? false,
        isPublic: data.isPublic ?? false,
      },
    });

    return toDto(created);
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
        ...(data.filters && { filters: toInputJson(data.filters) }),
        ...(data.columns !== undefined && { columns: toInputJson(data.columns) }),
        ...(data.sort !== undefined && { sort: toInputJson(data.sort) }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
      },
    });

    return toDto(updated);
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

    return toDto(updated);
  }
}
