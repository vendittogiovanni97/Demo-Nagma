export type Role = 'ADMIN' | 'USER' | 'ARTIST';

export interface User {
  id: string;
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

export type StaffType = 'TATTOO_ARTIST' | 'PIERCER' | 'OTHER';

export interface Staff {
  id: string;
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
  id: string;
  userId: string;
  weekStart: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  label?: string;
  isOff: boolean;
  notes?: string;
  user?: Pick<User, 'id' | 'name' | 'color'>;
}

export interface CreateShiftData {
  userId: string;
  weekStart: string;
  dayOfWeek: number;
  startTime?: string;
  endTime?: string;
  label?: string;
  isOff?: boolean;
  notes?: string;
}
