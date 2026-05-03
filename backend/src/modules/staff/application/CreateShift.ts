import { IShiftRepository } from '../contracts/IShiftRepository';
import { CreateShiftDTO } from '../contracts/ShiftDTOs';
import { Shift } from '../domain/Shift';
import { resolveShiftLabel, buildShiftDate } from './helpers';
import { AppError } from '../../../shared/errors/AppError';

export class CreateShift {
  constructor(private shiftRepository: IShiftRepository) {}

  async execute(data: CreateShiftDTO): Promise<Shift> {
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

    // Conflict check
    const conflict = await this.shiftRepository.hasConflict(data.staffId, date, startTime, endTime);
    if (conflict) {
      throw new AppError('Conflitto orario rilevato per questo staff nel giorno specificato', 409);
    }

    const shift = new Shift({
      staffId: data.staffId,
      date,
      startTime,
      endTime,
      notes: data.notes,
    });

    return this.shiftRepository.create(shift);
  }
}
