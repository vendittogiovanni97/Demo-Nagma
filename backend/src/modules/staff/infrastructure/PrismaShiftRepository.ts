import { PrismaClient, Prisma } from '@prisma/client';
import { IShiftRepository } from '../contracts/IShiftRepository';
import { Shift } from '../domain/Shift';
import prismaClient from '../../../shared/utils/prisma';

export class PrismaShiftRepository implements IShiftRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prismaClient;
  }

  private mapToDomain(raw: any): Shift {
    return new Shift({
      id: raw.id,
      staffId: raw.staffId,
      date: raw.date,
      startTime: raw.startTime,
      endTime: raw.endTime,
      breakDuration: raw.breakDuration,
      notes: raw.notes,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      staff: raw.staff,
    });
  }

  async findById(id: string): Promise<Shift | null> {
    const raw = await this.prisma.shift.findUnique({
      where: { id },
      include: { staff: true },
    });
    return raw ? this.mapToDomain(raw) : null;
  }

  async findAll(): Promise<Shift[]> {
    const raws = await this.prisma.shift.findMany({
      orderBy: { date: 'asc' },
      include: { staff: true },
    });
    return raws.map(this.mapToDomain);
  }

  async findByStaffId(staffId: number): Promise<Shift[]> {
    const raws = await this.prisma.shift.findMany({
      where: { staffId },
      orderBy: { date: 'asc' },
      include: { staff: true },
    });
    return raws.map(this.mapToDomain);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Shift[]> {
    const raws = await this.prisma.shift.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
      include: { staff: true },
    });
    return raws.map(this.mapToDomain);
  }

  async create(shift: Shift): Promise<Shift> {
    const data = shift.toJSON();
    const created = await this.prisma.shift.create({
      data: {
        staffId: data.staffId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        breakDuration: data.breakDuration,
        notes: data.notes,
      },
      include: { staff: true },
    });
    return this.mapToDomain(created);
  }

  async update(id: string, data: Partial<Shift>): Promise<Shift> {
    const updated = await this.prisma.shift.update({
      where: { id },
      data: data as any,
      include: { staff: true },
    });
    return this.mapToDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.shift.delete({ where: { id } });
  }

  async hasConflict(staffId: number, date: Date, startTime: string, endTime: string, excludeId?: string): Promise<boolean> {
    const shifts = await this.prisma.shift.findMany({
      where: {
        staffId,
        date: {
          gte: new Date(date.toDateString()),
          lt: new Date(new Date(date.toDateString()).getTime() + 24 * 60 * 60 * 1000),
        },
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    const newStart = this.timeToMinutes(startTime);
    const newEnd = this.timeToMinutes(endTime);

    for (const shift of shifts) {
      const existingStart = this.timeToMinutes(shift.startTime);
      const existingEnd = this.timeToMinutes(shift.endTime);

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
