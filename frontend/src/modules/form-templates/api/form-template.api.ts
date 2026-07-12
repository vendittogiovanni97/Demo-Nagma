import { apiClient } from '@/common/shared/api/client';
import { ENDPOINTS } from '@/common/shared/api/endpoints';
import type { FormTemplate } from '@/modules/form-templates/model/form-template.types';

export const formTemplateService = {
  getAll: async (startDate?: string, endDate?: string): Promise<FormTemplate[]> => {
    return apiClient.get<FormTemplate[]>(ENDPOINTS.FORM_TEMPLATES.BASE, { startDate, endDate });
  },
  getById: async (id: number): Promise<FormTemplate> => {
    return apiClient.get<FormTemplate>(ENDPOINTS.FORM_TEMPLATES.BY_ID(id));
  },
  create: async (data: Partial<FormTemplate>) => {
    return apiClient.post<FormTemplate>(ENDPOINTS.FORM_TEMPLATES.BASE, data);
  },
  update: async (id: number, data: Partial<FormTemplate>) => {
    return apiClient.put<FormTemplate>(ENDPOINTS.FORM_TEMPLATES.BY_ID(id), data);
  },
  delete: async (id: number) => {
    return apiClient.delete(ENDPOINTS.FORM_TEMPLATES.BY_ID(id));
  },
};