import { StaffType } from '../domain/Staff';

export interface CreateStaffDTO {
  name: string;
  type: StaffType;
  color?: string;
}

export interface UpdateStaffDTO {
  name?: string;
  type?: StaffType;
  color?: string;
}
