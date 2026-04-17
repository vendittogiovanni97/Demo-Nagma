export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'ARTIST';

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

export type StaffType = 'COLLABORATORE' | 'APPRENDISTA';

export interface Staff {
  id: number;
  name: string;
  type: StaffType;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffData {
  name: string;
  type: string;
  color: string;
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
