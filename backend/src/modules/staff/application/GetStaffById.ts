import { IStaffRepository } from '../contracts/IStaffRepository';
import { Staff } from '../domain/Staff';

export class GetStaffById {
  constructor(private staffRepository: IStaffRepository) {}

  async execute(id: number): Promise<Staff | null> {
    return this.staffRepository.findById(id);
  }
}
