import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Staff, CreateStaffData } from '@/types/team';

export const staffService = {
  getAll: async (): Promise<Staff[]> => {
    return apiClient.get<Staff[]>(ENDPOINTS.STAFF.BASE);
  },
  create: async (data: CreateStaffData): Promise<Staff> => {
    return apiClient.post<Staff>(ENDPOINTS.STAFF.BASE, data);
  },
  delete: async (id: string) => {
    return apiClient.delete(ENDPOINTS.STAFF.BY_ID(id));
  },
};
