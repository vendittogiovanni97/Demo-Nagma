import { IShiftRepository } from '../contracts/IShiftRepository';
import { Shift } from '../domain/Shift';

export class GetStaffShifts {
  constructor(private shiftRepository: IShiftRepository) {}

  async execute(staffId: number): Promise<Shift[]> {
    return this.shiftRepository.findByStaffId(staffId);
  }
}
