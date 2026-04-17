import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Staff, CreateStaffData, Shift, CreateShiftData } from '@/types/team';
import type { PaginatedResponse } from '@/types/pagination';

export const teamService = {
  getMembers: async ({
    search,
    type,
    page = 1,
    limit = 20,
  }: {
    search?: string;
    type?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<Staff>> => {
    return apiClient.get<PaginatedResponse<Staff>>(ENDPOINTS.TEAM.MEMBERS, { search, type, page, limit });
  },
  createMember: async (data: CreateStaffData) => {
    return apiClient.post(ENDPOINTS.TEAM.MEMBERS, data);
  },
  updateMember: async (id: number, data: Partial<CreateStaffData>): Promise<Staff> => {
    return apiClient.put<Staff>(ENDPOINTS.TEAM.MEMBER_BY_ID(id), data);
  },
  deleteMember: async (id: number) => {
    return apiClient.delete(ENDPOINTS.TEAM.MEMBER_BY_ID(id));
  },
  resetMemberPassword: async (id: number, newPassword: string): Promise<void> => {
    return apiClient.put<void>(`${ENDPOINTS.TEAM.MEMBER_BY_ID(id)}/reset-password`, { newPassword });
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
