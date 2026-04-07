import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import { User } from '@/types/customer';

export interface Shift {
  id: string;
  userId: string;
  weekStart: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isOff: boolean;
  notes?: string;
  user?: User;
}

interface CreateShiftPayload {
  userId: string;
  weekStart: string;
  dayOfWeek: number;
  startTime?: string;
  endTime?: string;
  isOff?: boolean;
  notes?: string;
}

export const teamService = {
  getUsers: (): Promise<User[]> =>
    apiClient.get(ENDPOINTS.TEAM.USERS),

  createUser: (data: Omit<User, 'id'> & { password: string }) =>
    apiClient.post(ENDPOINTS.TEAM.USERS, data),

  getShifts: (weekStart: string): Promise<Shift[]> =>
    apiClient.get(ENDPOINTS.TEAM.SHIFTS, { weekStart }),

  createShift: (data: CreateShiftPayload): Promise<Shift> =>
    apiClient.post(ENDPOINTS.TEAM.SHIFTS, data),

  updateShift: (id: string, data: Partial<CreateShiftPayload>): Promise<Shift> =>
    apiClient.put(ENDPOINTS.TEAM.SHIFT_BY_ID(id), data),

  deleteShift: (id: string) =>
    apiClient.delete(ENDPOINTS.TEAM.SHIFT_BY_ID(id)),
};
