import bcrypt from 'bcryptjs';
import type { Prisma } from '@prisma/client';
import { config } from '../config/env';
import { UserRepository } from '../repositories/user.repository';
import { ShiftRepository } from '../repositories/shift.repository';
import { AppError } from '../utils/AppError';
import { validate, CreateUserSchema, CreateShiftSchema, UpdateShiftSchema } from '../utils/validators';

const userRepo = new UserRepository();
const shiftRepo = new ShiftRepository();

export class TeamService {
  async getAllUsers(search?: string, role?: string, page = 1, limit = 20) {
    return userRepo.findAllPaged({ search, role, page, limit });
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
    return shiftRepo.findByWeek(new Date(weekStart));
  }

  async createShift(body: unknown) {
    const data = validate(CreateShiftSchema, body);
    return shiftRepo.create({
      user: { connect: { id: data.userId } },
      weekStart: new Date(data.weekStart),
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime ?? '',
      endTime: data.endTime ?? '',
      isOff: data.isOff ?? false,
      notes: data.notes,
    });
  }

  async updateShift(id: string, body: unknown) {
    const data = validate(UpdateShiftSchema, body);
    const updateData: Prisma.ShiftUpdateInput = {
      ...(data.weekStart ? { weekStart: new Date(data.weekStart) } : {}),
      ...(data.dayOfWeek !== undefined ? { dayOfWeek: data.dayOfWeek } : {}),
      ...(data.startTime !== undefined ? { startTime: data.startTime } : {}),
      ...(data.endTime !== undefined ? { endTime: data.endTime } : {}),
      ...(data.isOff !== undefined ? { isOff: data.isOff } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
    };

    return shiftRepo.update(id, updateData);
  }

  async deleteShift(id: string) {
    return shiftRepo.softDelete(id);
  }
}
