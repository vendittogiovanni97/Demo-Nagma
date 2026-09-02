import { Prisma, StaffType } from '@prisma/client';
import { AppError } from '../../../core/shared/errors/AppError';
import { buildPagination, paginate } from '../../../core/shared/kernel/pagination';
import { parseUTCDate } from '../../../core/shared/utils/date-utils';
import prisma from '../../../core/shared/utils/prisma';
import type { CreateStaffInput, UpdateStaffInput } from '../controllers/staff.schemas';

const SHIFT_LABEL_MAP: Record<string, { startTime: string; endTime: string; isOff: boolean }> = {
  'Mattina': { startTime: '09:00', endTime: '13:00', isOff: false },
  'Pomeriggio': { startTime: '14:00', endTime: '19:00', isOff: false },
  'Tutta la giornata': { startTime: '09:00', endTime: '19:00', isOff: false },
  'Riposo': { startTime: '', endTime: '', isOff: true },
};

function resolveShiftLabel(label?: string, defaults?: { startTime?: string; endTime?: string; isOff?: boolean }) {
  if (label && label in SHIFT_LABEL_MAP) return SHIFT_LABEL_MAP[label];
  return {
    startTime: defaults?.startTime,
    endTime: defaults?.endTime,
    isOff: defaults?.isOff,
  };
}

function buildShiftDate(weekStart: string, dayOfWeek: number) {
  const baseDate = parseUTCDate(weekStart);
  const date = new Date(baseDate);
  date.setUTCDate(baseDate.getUTCDate() + dayOfWeek);
  return date;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

export class StaffService {
  async searchMembers(filters: { search?: string; type?: string; page: number; limit: number }) {
    const { search, type, page = 1, limit = 25 } = filters;
    const where: Prisma.StaffWhereInput = { deletedAt: null };

    if (type) {
      const upperType = type.toUpperCase();
      if (upperType === 'COLLABORATORE' || upperType === 'APPRENDISTA') {
        where.type = upperType as StaffType;
      } else if (upperType === 'ARTIST') {
        where.type = StaffType.COLLABORATORE;
      }
    }

    if (search?.trim()) {
      where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
    }

    const [raws, total] = await prisma.$transaction([
      prisma.staff.findMany({
        where,
        ...buildPagination(page, limit),
        orderBy: { name: 'asc' },
      }),
      prisma.staff.count({ where }),
    ]);

    return paginate(raws, total, page, limit);
  }

  async listAllMembers() {
    return prisma.staff.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async getMemberById(id: number) {
    const member = await prisma.staff.findFirst({
      where: { id, deletedAt: null },
    });
    return member ?? null;
  }

  async createMember(data: CreateStaffInput) {
    const created = await prisma.staff.create({
      data: {
        name: data.name,
        type: data.type,
        color: data.color || '#00bfff',
        isRentPayee: data.isRentPayee ?? false,
      },
    });
    return created;
  }

  async updateMember(id: number, data: UpdateStaffInput) {
    const existing = await prisma.staff.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!existing) throw new AppError('Collaboratore non trovato.', 404);

    const updated = await prisma.staff.update({
      where: { id },
      data,
    });
    return updated;
  }

  async deleteMember(id: number) {
    const result = await prisma.staff.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    if (result.count === 0) throw new AppError('Collaboratore non trovato.', 404);
  }

  async listShifts(weekStart?: string) {
    if (!weekStart) {
      return prisma.shift.findMany({
        orderBy: { date: 'asc' },
        include: { staff: true },
      });
    }

    const startDate = parseUTCDate(weekStart);
    const endDate = new Date(startDate);
    endDate.setUTCDate(startDate.getUTCDate() + 6);

    return prisma.shift.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
      include: { staff: true },
    });
  }

  async getStaffShifts(staffId: number) {
    return prisma.shift.findMany({
      where: { staffId },
      orderBy: { date: 'asc' },
      include: { staff: true },
    });
  }

  async createShift(data: { staffId: number; label?: string; startTime?: string; endTime?: string; isOff?: boolean; date?: Date; weekStart?: string; dayOfWeek?: number; notes?: string }) {
    const resolved = resolveShiftLabel(data.label, data);

    let date: Date;
    if (data.date) {
      date = data.date;
    } else if (data.weekStart && data.dayOfWeek !== undefined) {
      date = buildShiftDate(data.weekStart, data.dayOfWeek);
    } else {
      throw new AppError('Data o weekStart/dayOfWeek obbligatori', 400);
    }

    if (!resolved.isOff && (!resolved.startTime || !resolved.endTime)) {
      throw new AppError('startTime ed endTime sono obbligatori se il turno non è di riposo', 400);
    }

    const startTime = resolved.startTime ?? '00:00';
    const endTime = resolved.endTime ?? '00:00';

    const existingShifts = await prisma.shift.findMany({
      where: {
        staffId: data.staffId,
        date: {
          gte: new Date(date.toDateString()),
          lt: new Date(new Date(date.toDateString()).getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    const newStart = timeToMinutes(startTime);
    const newEnd = timeToMinutes(endTime);
    const hasConflict = existingShifts.some((shift) => {
      const existingStart = timeToMinutes(shift.startTime);
      const existingEnd = timeToMinutes(shift.endTime);
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (hasConflict) {
      throw new AppError('Conflitto orario rilevato per questo staff nel giorno specificato', 409);
    }

    const created = await prisma.shift.create({
      data: {
        staffId: data.staffId,
        date,
        startTime,
        endTime,
        notes: data.notes,
      },
      include: { staff: true },
    });

    return created;
  }

  async updateShift(id: string, data: { label?: string; startTime?: string; endTime?: string; isOff?: boolean; weekStart?: string; dayOfWeek?: number; notes?: string }) {
    const existing = await prisma.shift.findUnique({ where: { id } });
    if (!existing) throw new AppError('Turno non trovato', 404);

    const resolved = resolveShiftLabel(data.label, data);

    let nextDate = existing.date;
    if (data.weekStart !== undefined && data.dayOfWeek !== undefined) {
      nextDate = buildShiftDate(data.weekStart, data.dayOfWeek);
    }

    const updateData: Prisma.ShiftUpdateInput = {};
    if (data.weekStart !== undefined && data.dayOfWeek !== undefined) {
      updateData.date = nextDate;
    }
    if (data.startTime !== undefined) updateData.startTime = data.startTime;
    if (data.endTime !== undefined) updateData.endTime = data.endTime;
    if (data.notes !== undefined) updateData.notes = data.notes;

    if (data.isOff) {
      updateData.startTime = '00:00';
      updateData.endTime = '00:00';
    } else {
      if (resolved.startTime !== undefined && data.startTime === undefined) updateData.startTime = resolved.startTime;
      if (resolved.endTime !== undefined && data.endTime === undefined) updateData.endTime = resolved.endTime;
    }

    const updated = await prisma.shift.update({
      where: { id },
      data: updateData,
      include: { staff: true },
    });

    return updated;
  }

  async deleteShift(id: string) {
    await prisma.shift.delete({ where: { id } });
  }
}
