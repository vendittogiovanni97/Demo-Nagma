import { Staff } from '../domain/Staff';
import { IPaginatedResponse } from '../../../shared/kernel/interfaces';

export interface StaffFilters {
  search?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export interface IStaffRepository {
  findById(id: number): Promise<Staff | null>;
  findAll(): Promise<Staff[]>;
  findAllPaged(filters: StaffFilters): Promise<IPaginatedResponse<Staff>>;
  create(staff: Staff): Promise<Staff>;
  update(id: number, data: Partial<Staff>): Promise<Staff>;
  delete(id: number): Promise<void>;
  softDelete(id: number): Promise<void>;
}
