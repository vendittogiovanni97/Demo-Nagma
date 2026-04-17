import bcrypt from 'bcryptjs';
import type { Prisma, Shift } from '@prisma/client';
import { config } from '../config/env';
import { UserRepository } from '../repositories/user.repository';
import { StaffRepository } from '../repositories/staff.repository';
import { ShiftRepository } from '../repositories/shift.repository';
import { AppError } from '../utils/AppError';
import { validate, createStaffSchema, createShiftSchema, updateShiftSchema, updateStaffSchema, resetPasswordSchema } from '../schemas';
import { getStartOfWeek, parseUTCDate } from '../utils/date-utils';

const userRepo = new UserRepository();
const staffRepo = new StaffRepository();
const shiftRepo = new ShiftRepository();

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

export class TeamService {
  private shiftRepository: ShiftRepository;

  constructor() {
    this.shiftRepository = shiftRepo;
  }

  /**
   * Restituisce la lista dello staff (ex-users nel team grid)
   */
  async getAllUsers(search?: string, type?: string, page = 1, limit = 20) {
    return staffRepo.findAllPaged({
      search,
      type,
      page,
      limit,
    });
  }

  async createUser(body: unknown) {
    const data = validate(createStaffSchema, body);
    return staffRepo.create(data);
  }

  async deleteUser(id: number) {
    return staffRepo.delete(id);
  }

  async getShifts(weekStart?: string) {
    if (!weekStart) throw new AppError('Il parametro weekStart è obbligatorio (es. "2026-03-30").', 400);
    const allStaff = await staffRepo.findAllShifts();
    
    const flattenedShifts: any[] = [];
    allStaff.forEach(s => {
      const staffShifts = (s.shifts as any)?.[weekStart];
      if (staffShifts) {
        Object.entries(staffShifts).forEach(([day, shift]: [string, any]) => {
          flattenedShifts.push({
            id: `${s.id}-${weekStart}-${day}`, // ID sintetico per mantenere compatibility frontend
            staffId: s.id,
            weekStart,
            dayOfWeek: parseInt(day),
            ...shift,
            staff: { id: s.id, name: s.name, color: s.color, type: s.type }
          });
        });
      }
    });

    return flattenedShifts;
  }

  async createShift(body: unknown) {
    const data = validate(createShiftSchema, body);
    const resolved = resolveShiftLabel(data.label, data);
    const weekStart = data.weekStart;

    const staff = await staffRepo.findById(data.staffId);
    if (!staff) throw new AppError('Staff non trovato', 404);

    const shifts = (staff.shifts as any) || {};
    if (!shifts[weekStart]) shifts[weekStart] = {};
    
    shifts[weekStart][data.dayOfWeek] = {
      startTime: resolved.startTime ?? '',
      endTime: resolved.endTime ?? '',
      label: data.label,
      isOff: resolved.isOff ?? false,
      notes: data.notes,
    };

    await staffRepo.update(staff.id, { shifts });
    
    return {
      id: `${staff.id}-${weekStart}-${data.dayOfWeek}`,
      staffId: staff.id,
      weekStart,
      dayOfWeek: data.dayOfWeek,
      ...shifts[weekStart][data.dayOfWeek],
      staff: { id: staff.id, name: staff.name, color: staff.color, type: staff.type }
    };
  }

  async updateShift(compositeId: string, body: unknown) {
    // In questo nuovo modello, usiamo i dati nel body o l'ID sintetico (staffId-weekStart-day)
    const data = validate(updateShiftSchema, body);
    const [staffIdStr, weekStart, dayStr] = compositeId.split('-');
    const staffId = parseInt(staffIdStr);
    const dayOfWeek = parseInt(dayStr);

    if (isNaN(staffId) || !weekStart || isNaN(dayOfWeek)) {
      throw new AppError('ID shift non valido (formato atteso: staffId-weekStart-dayOfWeek)', 400);
    }

    const staff = await staffRepo.findById(staffId);
    if (!staff) throw new AppError('Staff non trovato', 404);

    const shifts = (staff.shifts as any) || {};
    if (!shifts[weekStart] || !shifts[weekStart][dayOfWeek]) {
      throw new AppError('Turno non trovato per questa data', 404);
    }

    const currentShift = shifts[weekStart][dayOfWeek];
    const resolved = resolveShiftLabel(data.label ?? currentShift.label, data as any);

    shifts[weekStart][dayOfWeek] = {
      ...currentShift,
      ...(data.startTime !== undefined ? { startTime: data.startTime } : { startTime: resolved.startTime }),
      ...(data.endTime !== undefined ? { endTime: data.endTime } : { endTime: resolved.endTime }),
      ...(data.label !== undefined ? { label: data.label } : {}),
      ...(data.isOff !== undefined ? { isOff: data.isOff } : { isOff: resolved.isOff }),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
    };

    await staffRepo.update(staff.id, { shifts });

    return {
      id: compositeId,
      staffId: staff.id,
      weekStart,
      dayOfWeek,
      ...shifts[weekStart][dayOfWeek],
      staff: { id: staff.id, name: staff.name, color: staff.color, type: staff.type }
    };
  }

  async deleteShift(compositeId: string) {
    const [staffIdStr, weekStart, dayStr] = compositeId.split('-');
    const staffId = parseInt(staffIdStr);
    const dayOfWeek = parseInt(dayStr);

    if (isNaN(staffId) || !weekStart || isNaN(dayOfWeek)) {
      throw new AppError('ID shift non valido', 400);
    }

    const staff = await staffRepo.findById(staffId);
    if (!staff) throw new AppError('Staff non trovato', 404);

    const shifts = (staff.shifts as any) || {};
    if (shifts[weekStart] && shifts[weekStart][dayOfWeek]) {
      delete shifts[weekStart][dayOfWeek];
      if (Object.keys(shifts[weekStart]).length === 0) {
        delete shifts[weekStart];
      }
      await staffRepo.update(staff.id, { shifts });
    }
  }

  /**
   * Restituisce tutti i turni dal repository
   */
  async findAllShifts(): Promise<Shift[]> {
    return this.shiftRepository.findAll();
  }

  /**
   * Restituisce i turni di uno specifico staff
   */
  async getStaffShifts(staffId: string): Promise<Shift[]> {
    return this.shiftRepository.findByStaffId(staffId);
  }

  /**
   * Crea un nuovo turno con controllo di conflitti orari
   */
  async createShiftWithConflictCheck(data: {
    staffId: string;
    date: Date;
    startTime: string;
    endTime: string;
    breakDuration?: number;
    notes?: string;
  }): Promise<Shift> {
    const conflict = await this.shiftRepository.isTimeConflict(
      data.staffId,
      data.date,
      data.startTime,
      data.endTime
    );
    if (conflict) {
      throw new AppError('Conflitto orario rilevato per questo staff nel giorno specificato', 409);
    }
    return this.shiftRepository.create(data);
  }

  /**
   * Elimina un turno
   */
  async deleteShiftById(id: string): Promise<void> {
    return this.shiftRepository.delete(id);
  }

  async updateUser(id: number, body: unknown) {
    const data = validate(updateStaffSchema, body);
    return staffRepo.update(id, data);
  }

  async resetPassword(id: number, body: unknown) {
    const data = validate(resetPasswordSchema, body);

    // Nota: La gestione password rimane solo per gli utenti di sistema (Admin)
    const user = await userRepo.findById(id);
    if (!user) throw new AppError('Utente non trovato.', 404);

    const hashedPassword = await bcrypt.hash(data.newPassword, config.bcryptSaltRounds);
    return userRepo.updatePassword(id, hashedPassword);
  }
}
