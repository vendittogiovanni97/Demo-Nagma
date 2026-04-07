import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository';
import { ShiftRepository } from '../repositories/shift.repository';
import { AppError } from '../utils/AppError';
import { validate, CreateUserSchema, CreateShiftSchema } from '../utils/validators';

const userRepo = new UserRepository();
const shiftRepo = new ShiftRepository();

export class TeamService {
  async getAllUsers() {
    return userRepo.findAll();
  }

  async createUser(body: unknown) {
    const data = validate(CreateUserSchema, body);
    const exists = await userRepo.findByEmail(data.email);
    if (exists) throw new AppError('Email già in uso.', 400);

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return userRepo.create({ ...data, password: hashedPassword });
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

  async updateShift(id: string, data: object) {
    return shiftRepo.update(id, data);
  }

  async deleteShift(id: string) {
    return shiftRepo.softDelete(id);
  }
}
