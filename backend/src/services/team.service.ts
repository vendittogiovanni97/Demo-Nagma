import bcrypt from 'bcryptjs';
import type { Prisma } from '@prisma/client';
import { config } from '../config/env';
import { UserRepository } from '../repositories/user.repository';
import { ShiftRepository } from '../repositories/shift.repository';
import { AppError } from '../utils/AppError';
import { validate, CreateUserSchema, CreateShiftSchema, UpdateShiftSchema } from '../utils/validators';
import { getStartOfWeek, parseUTCDate } from '../utils/date-utils';

const userRepo = new UserRepository();
const shiftRepo = new ShiftRepository();

export class TeamService {
  async getAllUsers(search?: string, role?: string, page = 1, limit = 20) {
    return userRepo.findAllPaged({
      search,
      role,
      excludeRoles: ['ADMIN', 'SUPER_ADMIN'],
      page,
      limit,
    });
  }

  async createUser(body: unknown) {
    const data = validate(CreateUserSchema, body);
    const exists = await userRepo.findByEmail(data.email);
    if (exists) throw new AppError('Email già in uso.', 400);

    const hashedPassword = await bcrypt.hash(data.password, config.bcryptSaltRounds);
    return userRepo.create({ ...data, password: hashedPassword });
  }

  async deleteUser(id: string) {
    return userRepo.softDelete(id);
  }

  async getShifts(weekStart?: string) {
    if (!weekStart) throw new AppError('Il parametro weekStart è obbligatorio (es. "2026-03-30").', 400);
    return shiftRepo.findByWeek(new Date(weekStart), ['ADMIN', 'SUPER_ADMIN']);
  }

  async createShift(body: unknown) {
    const data = validate(CreateShiftSchema, body);
    
    let { startTime, endTime, isOff } = data;
    
    if (data.label) {
      if (data.label === 'Mattina') {
        startTime = '09:00';
        endTime = '13:00';
        isOff = false;
      } else if (data.label === 'Pomeriggio') {
        startTime = '14:00';
        endTime = '19:00';
        isOff = false;
      } else if (data.label === 'Tutta la giornata') {
        startTime = '09:00';
        endTime = '19:00';
        isOff = false;
      } else if (data.label === 'Riposo') {
        startTime = '';
        endTime = '';
        isOff = true;
      }
    }

    return shiftRepo.create({
      user: { connect: { id: data.userId } },
      weekStart: getStartOfWeek(parseUTCDate(data.weekStart)),
      dayOfWeek: data.dayOfWeek,
      startTime: startTime ?? '',
      endTime: endTime ?? '',
      label: data.label,
      isOff: isOff ?? false,
      notes: data.notes,
    });
  }

  async updateShift(id: string, body: unknown) {
    const data = validate(UpdateShiftSchema, body);
    
    let { startTime, endTime, isOff } = data;
    
    if (data.label) {
      if (data.label === 'Mattina') {
        startTime = '09:00';
        endTime = '13:00';
        isOff = false;
      } else if (data.label === 'Pomeriggio') {
        startTime = '14:00';
        endTime = '19:00';
        isOff = false;
      } else if (data.label === 'Tutta la giornata') {
        startTime = '09:00';
        endTime = '19:00';
        isOff = false;
      } else if (data.label === 'Riposo') {
        startTime = '';
        endTime = '';
        isOff = true;
      }
    }

    const updateData: Prisma.ShiftUpdateInput = {
      ...(data.weekStart ? { weekStart: getStartOfWeek(parseUTCDate(data.weekStart)) } : {}),
      ...(data.dayOfWeek !== undefined ? { dayOfWeek: data.dayOfWeek } : {}),
      ...(startTime !== undefined ? { startTime } : {}),
      ...(endTime !== undefined ? { endTime } : {}),
      ...(data.label !== undefined ? { label: data.label } : {}),
      ...(isOff !== undefined ? { isOff } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
    };

    return shiftRepo.update(id, updateData);
  }

  async deleteShift(id: string) {
    return shiftRepo.softDelete(id);
  }
}
