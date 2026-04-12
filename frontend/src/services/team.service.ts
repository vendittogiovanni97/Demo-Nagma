import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { User, CreateUserData, Shift, CreateShiftData } from '@/types/team';
import type { PaginatedResponse } from '@/types/pagination';

export const teamService = {
  getUsers: async ({
    search,
    role,
    page = 1,
    limit = 20,
  }: {
    search?: string;
    role?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<User>> => {
    return apiClient.get<PaginatedResponse<User>>(ENDPOINTS.TEAM.USERS, { search, role, page, limit });
  },
  createUser: async (data: CreateUserData) => {
    return apiClient.post(ENDPOINTS.TEAM.USERS, data);
  },
  deleteUser: async (id: string) => {
    return apiClient.delete(ENDPOINTS.TEAM.USER_BY_ID(id));
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
