import { apiClient, createCrudService } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { Staff } from '../model/team.types';

export const staffApi = {
  ...createCrudService<Staff>(ENDPOINTS.STAFF.BASE, ENDPOINTS.STAFF.BY_ID),
  getAllForSelect: async (): Promise<Staff[]> => {
    return apiClient.get<Staff[]>(ENDPOINTS.STAFF.LIST);
  },
};
