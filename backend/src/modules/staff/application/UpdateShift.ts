import { IShiftRepository } from '../contracts/IShiftRepository';
import { UpdateShiftDTO } from '../contracts/ShiftDTOs';
import { Shift } from '../domain/Shift';
import { resolveShiftLabel, buildShiftDate } from './helpers';
import { AppError } from '../../../shared/errors/AppError';

export class UpdateShift {
  constructor(private shiftRepository: IShiftRepository) {}

  async execute(id: string, data: UpdateShiftDTO): Promise<Shift> {
    const existing = await this.shiftRepository.findById(id);
    if (!existing) throw new AppError('Turno non trovato', 404);

    const resolved = resolveShiftLabel(data.label, data as any);
    
    let nextDate = existing.date;
    if (data.weekStart !== undefined && data.dayOfWeek !== undefined) {
      nextDate = buildShiftDate(data.weekStart, data.dayOfWeek);
    }

    const updateData: any = {
      ...(data.weekStart !== undefined && data.dayOfWeek !== undefined ? { date: nextDate } : {}),
      ...(data.startTime !== undefined ? { startTime: data.startTime } : {}),
      ...(data.endTime !== undefined ? { endTime: data.endTime } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
    };

    if (data.isOff) {
      updateData.startTime = '00:00';
      updateData.endTime = '00:00';
    } else {
      if (resolved.startTime !== undefined && data.startTime === undefined) updateData.startTime = resolved.startTime;
      if (resolved.endTime !== undefined && data.endTime === undefined) updateData.endTime = resolved.endTime;
    }

    return this.shiftRepository.update(id, updateData);
  }
}
