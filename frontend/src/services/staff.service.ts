import { createCrudService } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Staff } from '@/types/team';

export const staffService = {
  ...createCrudService<Staff>(ENDPOINTS.STAFF.BASE, ENDPOINTS.STAFF.BY_ID),
};
