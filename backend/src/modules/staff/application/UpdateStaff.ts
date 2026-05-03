import { IStaffRepository } from '../contracts/IStaffRepository';
import { UpdateStaffDTO } from '../contracts/StaffDTOs';
import { Staff } from '../domain/Staff';

export class UpdateStaff {
  constructor(private staffRepository: IStaffRepository) {}

  async execute(id: number, data: UpdateStaffDTO): Promise<Staff> {
    return this.staffRepository.update(id, data);
  }
}
