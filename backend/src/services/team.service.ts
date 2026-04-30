import type { Shift } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { configService } from './config.service';

import { ShiftService } from './shift.service';
import { StaffService } from './staff.service';
import { createShiftSchema, createStaffSchema, resetPasswordSchema, updateShiftSchema, updateStaffSchema, validate } from '../schemas';
import { AppError } from '../utils/AppError';
import { parseUTCDate } from '../utils/date-utils';


const staffService = new StaffService();
const shiftService = new ShiftService();

const SHIFT_LABEL_MAP: Record<string, { startTime: string; endTime: string; isOff: boolean }> = {
  'Mattina':            { startTime: '09:00', endTime: '13:00', isOff: false },
  'Pomeriggio':         { startTime: '14:00', endTime: '19:00', isOff: false },
  'Tutta la giornata':  { startTime: '09:00', endTime: '19:00', isOff: false },
  'Riposo':             { startTime: '',      endTime: '',      isOff: true },
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

export class TeamService {
  private shiftService: ShiftService;

  constructor() {
    this.shiftService = shiftService;
  }

  /**
   * Restituisce la lista dello staff (ex-users nel team grid)
   */
  async getAllUsers(search?: string, type?: string, page = 1, limit = 20) {
    return staffService.findAllPaged({
      search,
      type,
      page,
      limit,
    });
  }

  async createUser(body: unknown) {
    const data = validate(createStaffSchema, body);
    return staffService.create(data);
  }

  async deleteUser(id: number) {
    return staffService.delete(id);
  }

  async getShifts(weekStart?: string) {
    if (!weekStart) throw new AppError('Il parametro weekStart è obbligatorio (es. "2026-03-30").', 400);
    const startDate = parseUTCDate(weekStart);
    const endDate = new Date(startDate);
    endDate.setUTCDate(startDate.getUTCDate() + 6);

    return shiftService.findByDateRange(startDate, endDate);
  }

  async createShift(body: unknown) {
    const data = validate(createShiftSchema, body);
    const resolved = resolveShiftLabel(data.label, data);
    const staff = await staffService.findById(data.staffId);
    if (!staff) throw new AppError('Staff non trovato', 404);
    const date = buildShiftDate(data.weekStart, data.dayOfWeek);

    if (!resolved.isOff && (!resolved.startTime || !resolved.endTime)) {
      throw new AppError('startTime ed endTime sono obbligatori se il turno non è di riposo', 400);
    }

    return shiftService.create({
      staffId: data.staffId,
      date,
      startTime: resolved.startTime ?? '00:00',
      endTime: resolved.endTime ?? '00:00',
      notes: data.notes,
      breakDuration: undefined,
    });
  }

  async updateShift(id: string, body: unknown) {
    const data = validate(updateShiftSchema, body);
    const existing = await shiftService.findById(id);
    if (!existing) throw new AppError('Turno non trovato', 404);

    const resolved = resolveShiftLabel(data.label, data as any);
    const nextDate = data.weekStart !== undefined && data.dayOfWeek !== undefined
      ? buildShiftDate(data.weekStart, data.dayOfWeek)
      : existing.date;

    return shiftService.update(id, {
      ...(data.weekStart !== undefined && data.dayOfWeek !== undefined ? { date: nextDate } : {}),
      ...(data.startTime !== undefined ? { startTime: data.startTime } : {}),
      ...(data.endTime !== undefined ? { endTime: data.endTime } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
      ...(data.isOff ? { startTime: '00:00', endTime: '00:00' } : {}),
      ...(!data.isOff && resolved.startTime !== undefined && data.startTime === undefined ? { startTime: resolved.startTime } : {}),
      ...(!data.isOff && resolved.endTime !== undefined && data.endTime === undefined ? { endTime: resolved.endTime } : {}),
    });
  }

  async deleteShift(id: string) {
    return shiftService.delete(id);
  }

  /**
   * Restituisce tutti i turni dal repository
   */
  async findAllShifts(): Promise<Shift[]> {
    return this.shiftService.findAll();
  }

  /**
   * Restituisce i turni di uno specifico staff
   */
  async getStaffShifts(staffId: string | number): Promise<Shift[]> {
    const parsedStaffId = typeof staffId === 'number' ? staffId : Number(staffId);
    if (Number.isNaN(parsedStaffId)) {
      throw new AppError('staffId non valido', 400);
    }
    return this.shiftService.findByStaffId(parsedStaffId);
  }

  /**
   * Crea un nuovo turno con controllo di conflitti orari
   */
  async createShiftWithConflictCheck(data: {
    staffId: number;
    date: Date;
    startTime: string;
    endTime: string;
    breakDuration?: number;
    notes?: string;
  }): Promise<Shift> {
    const conflict = await this.shiftService.isTimeConflict(
      data.staffId,
      data.date,
      data.startTime,
      data.endTime
    );
    if (conflict) {
      throw new AppError('Conflitto orario rilevato per questo staff nel giorno specificato', 409);
    }
    return this.shiftService.create(data);
  }

  /**
   * Elimina un turno
   */
  async deleteShiftById(id: string): Promise<void> {
    return this.shiftService.delete(id);
  }

  async findMemberById(id: number) {
    return staffService.findById(id);
  }

  async updateUser(id: number, body: unknown) {
    const data = validate(updateStaffSchema, body);
    return staffService.update(id, data);
  }

  async resetPassword(id: number, body: unknown) {
    const data = validate(resetPasswordSchema, body);

    // Nota: La gestione password rimane solo per gli utenti di sistema (Admin)
    const user = await prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!user) throw new AppError('Utente non trovato.', 404);

    const hashedPassword = await bcrypt.hash(data.newPassword, configService.getBcryptSaltRoundsSync());
    return prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      omit: { password: true }
    });
  }
}
