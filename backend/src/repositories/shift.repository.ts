import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';

export type ShiftData = {
  date: Date;
  startTime: string;
  endTime: string;
  breakDuration?: number;
  notes?: string;
  staffId: string;
};

export class ShiftRepository {
  async create(data: {
    date: Date;
    startTime: string;
    endTime: string;
    breakDuration?: number;
    notes?: string;
    staffId: string;
  }) {
    const staffId = parseInt(data.staffId, 10);
    if (isNaN(staffId)) {
      throw new Error('Invalid staffId: must be a valid integer');
    }

    return prisma.shift.create({
      data: {
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        breakDuration: data.breakDuration,
        notes: data.notes,
        staffId,
      },
      include: { staff: true },
    });
  }

  async findById(id: string) {
    return prisma.shift.findUnique({
      where: { id },
      include: { staff: true },
    });
  }

  async findAll() {
    return prisma.shift.findMany({
      orderBy: { date: 'asc' },
      include: { staff: true },
    });
  }

  async update(id: string, data: Partial<ShiftData>) {
    const updateData: Prisma.ShiftUpdateInput = {};

    if (data.date !== undefined) updateData.date = data.date;
    if (data.startTime !== undefined) updateData.startTime = data.startTime;
    if (data.endTime !== undefined) updateData.endTime = data.endTime;
    if (data.breakDuration !== undefined) updateData.breakDuration = data.breakDuration;
    if (data.notes !== undefined) updateData.notes = data.notes;

    if (data.staffId !== undefined) {
      const staffId = parseInt(data.staffId, 10);
      if (isNaN(staffId)) {
        throw new Error('Invalid staffId: must be a valid integer');
      }
      updateData.staffId = staffId;
    }

    return prisma.shift.update({
      where: { id },
      data: updateData,
      include: { staff: true },
    });
  }

  async delete(id: string) {
    await prisma.shift.delete({ where: { id } });
  }

  async findByStaffId(staffId: string) {
    const parsedStaffId = parseInt(staffId, 10);
    if (isNaN(parsedStaffId)) {
      throw new Error('Invalid staffId: must be a valid integer');
    }

    return prisma.shift.findMany({
      where: { staffId: parsedStaffId },
      orderBy: { date: 'asc' },
      include: { staff: true },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date) {
    return prisma.shift.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
      include: { staff: true },
    });
  }

  async findByStaffAndDateRange(
    staffId: string,
    startDate: Date,
    endDate: Date
  ) {
    const parsedStaffId = parseInt(staffId, 10);
    if (isNaN(parsedStaffId)) {
      throw new Error('Invalid staffId: must be a valid integer');
    }

    return prisma.shift.findMany({
      where: {
        staffId: parsedStaffId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
      include: { staff: true },
    });
  }

  async isTimeConflict(
    staffId: string,
    date: Date,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<boolean> {
    const parsedStaffId = parseInt(staffId, 10);
    if (isNaN(parsedStaffId)) {
      throw new Error('Invalid staffId: must be a valid integer');
    }

    const shifts = await prisma.shift.findMany({
      where: {
        staffId: parsedStaffId,
        date: {
          gte: new Date(date.toDateString()),
          lt: new Date(new Date(date.toDateString()).getTime() + 24 * 60 * 60 * 1000),
        },
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    for (const shift of shifts) {
      const shiftStart = shift.startTime;
      const shiftEnd = shift.endTime;

      const newStart = this.timeToMinutes(startTime);
      const newEnd = this.timeToMinutes(endTime);
      const existingStart = this.timeToMinutes(shiftStart);
      const existingEnd = this.timeToMinutes(shiftEnd);

      if (newStart < existingEnd && newEnd > existingStart) {
        return true;
      }
    }

    return false;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  }
}
