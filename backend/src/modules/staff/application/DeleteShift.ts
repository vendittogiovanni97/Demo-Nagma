import { IShiftRepository } from '../contracts/IShiftRepository';

export class DeleteShift {
  constructor(private shiftRepository: IShiftRepository) {}

  async execute(id: string): Promise<void> {
    return this.shiftRepository.delete(id);
  }
}
