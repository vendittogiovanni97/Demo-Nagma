import { IStaffRepository } from '../contracts/IStaffRepository';
import { CreateStaffDTO } from '../contracts/StaffDTOs';
import { Staff } from '../domain/Staff';

export class CreateStaff {
  constructor(private staffRepository: IStaffRepository) {}

  async execute(data: CreateStaffDTO): Promise<Staff> {
    const staff = new Staff({
      name: data.name,
      type: data.type,
      color: data.color,
    });
    return this.staffRepository.create(staff);
  }
}
