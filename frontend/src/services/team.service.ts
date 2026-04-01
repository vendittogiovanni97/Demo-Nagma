import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';

export const teamService = {
  getUsers: async (): Promise<any[]> => {
    return apiClient.get<any[]>(ENDPOINTS.TEAM.USERS);
  },
  createUser: async (data: any) => {
    return apiClient.post(ENDPOINTS.TEAM.USERS, data);
  },
  getShifts: async (weekStart: string): Promise<any[]> => {
    return apiClient.get<any[]>(ENDPOINTS.TEAM.SHIFTS, { weekStart });
  },
  createShift: async (data: any) => {
    return apiClient.post(ENDPOINTS.TEAM.SHIFTS, data);
  },
  updateShift: async (id: string, data: any) => {
    return apiClient.put(ENDPOINTS.TEAM.SHIFT_BY_ID(id), data);
  },
  deleteShift: async (id: string) => {
    return apiClient.delete(ENDPOINTS.TEAM.SHIFT_BY_ID(id));
  },
};
