import { UserRepository } from '../repositories/user.repository';
import { ShiftRepository } from '../repositories/shift.repository';

export class TeamService {
  private userRepo = new UserRepository();
  private shiftRepo = new ShiftRepository();

  async getAllUsers() {
    return this.userRepo.findAll();
  }

  async createUser(data: any) {
    return this.userRepo.create(data);
  }

  async getShifts(weekStartStr: string) {
    if (!weekStartStr) throw new Error('Query param weekStart is required (e.g. "2026-03-30")');
    return this.shiftRepo.findByWeek(new Date(weekStartStr));
  }

  async createShift(data: any) {
    return this.shiftRepo.create({
      user: { connect: { id: data.userId } },
      weekStart: new Date(data.weekStart),
      dayOfWeek: parseInt(data.dayOfWeek),
      startTime: data.startTime || '',
      endTime: data.endTime || '',
      isOff: data.isOff || false,
      notes: data.notes
    });
  }

  async updateShift(id: string, data: any) {
    return this.shiftRepo.update(id, data);
  }

  async deleteShift(id: string) {
    return this.shiftRepo.softDelete(id);
  }
}

