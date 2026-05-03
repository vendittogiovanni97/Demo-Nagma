import { IStaffRepository, StaffFilters } from '../contracts/IStaffRepository';
import { IPaginatedResponse } from '../../../shared/kernel/interfaces';
import { Staff } from '../domain/Staff';

export class ListStaff {
  constructor(private staffRepository: IStaffRepository) {}

  async execute(filters: StaffFilters): Promise<IPaginatedResponse<Staff>> {
    return this.staffRepository.findAllPaged(filters);
  }

  async executeAll(): Promise<Staff[]> {
    return this.staffRepository.findAll();
  }
}
