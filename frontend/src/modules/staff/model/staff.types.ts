import { Role, type StaffType } from '@/common/shared/types/enums';
export { Role };
export type { StaffType };

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  color?: string;
  createdAt: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  color?: string;
}

export interface Staff {
  id: number;
  name: string;
  type: StaffType;
  color?: string;
  isRentPayee?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffData {
  name: string;
  type: StaffType;
  color: string;
  isRentPayee?: boolean;
}

export interface Shift {
  id: string; // Composite: staffId-weekStart-day
  staffId: number;
  weekStart: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  label?: string;
  isOff: boolean;
  notes?: string;
  staff?: Pick<Staff, 'id' | 'name' | 'color'>;
}

export interface CreateShiftData {
  staffId: number;
  weekStart: string;
  dayOfWeek: number;
  startTime?: string;
  endTime?: string;
  label?: string;
  isOff?: boolean;
  notes?: string;
}
