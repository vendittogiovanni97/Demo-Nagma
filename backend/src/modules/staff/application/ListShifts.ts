import { IShiftRepository } from '../contracts/IShiftRepository';
import { Shift } from '../domain/Shift';
import { parseUTCDate } from '../../../shared/utils/date-utils';
import { AppError } from '../../../shared/errors/AppError';

export class ListShifts {
  constructor(private shiftRepository: IShiftRepository) {}

  async execute(weekStart?: string): Promise<Shift[]> {
    if (!weekStart) {
      return this.shiftRepository.findAll();
    }
    
    const startDate = parseUTCDate(weekStart);
    const endDate = new Date(startDate);
    endDate.setUTCDate(startDate.getUTCDate() + 6);

    return this.shiftRepository.findByDateRange(startDate, endDate);
  }
}
