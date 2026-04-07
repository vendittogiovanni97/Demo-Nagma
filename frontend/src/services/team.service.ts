import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { User, CreateUserData, Shift, CreateShiftData } from '@/types';

export const teamService = {
  getUsers: async (): Promise<User[]> => {
    return apiClient.get<User[]>(ENDPOINTS.TEAM.USERS);
  },
  createUser: async (data: CreateUserData) => {
    return apiClient.post(ENDPOINTS.TEAM.USERS, data);
  },
  getShifts: async (weekStart: string): Promise<Shift[]> => {
    return apiClient.get<Shift[]>(ENDPOINTS.TEAM.SHIFTS, { weekStart });
  },
  createShift: async (data: CreateShiftData) => {
    return apiClient.post(ENDPOINTS.TEAM.SHIFTS, data);
  },
  updateShift: async (id: string, data: Partial<CreateShiftData>) => {
    return apiClient.put(ENDPOINTS.TEAM.SHIFT_BY_ID(id), data);
  },
  deleteShift: async (id: string) => {
    return apiClient.delete(ENDPOINTS.TEAM.SHIFT_BY_ID(id));
  },
};
