import { IStaffRepository } from '../contracts/IStaffRepository';

export class DeleteStaff {
  constructor(private staffRepository: IStaffRepository) {}

  async execute(id: number): Promise<void> {
    return this.staffRepository.softDelete(id);
  }
}
