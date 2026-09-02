import { apiClient } from '@/common/shared/api/client';
import { ENDPOINTS } from '@/common/shared/api/endpoints';
import type { FormTemplate } from '@/modules/form-templates/model/form-template.types';

export const formTemplateService = {
  getAll: async (startDate?: string, endDate?: string): Promise<FormTemplate[]> => {
    const res = await apiClient.get<{ data: FormTemplate[] }>(ENDPOINTS.FORM_TEMPLATES.BASE, { startDate, endDate });
    return res.data;
  },
  getById: async (id: number): Promise<FormTemplate> => {
    const res = await apiClient.get<{ data: FormTemplate }>(ENDPOINTS.FORM_TEMPLATES.BY_ID(id));
    return res.data;
  },
  create: async (data: Partial<FormTemplate>): Promise<FormTemplate> => {
    const res = await apiClient.post<{ data: FormTemplate }>(ENDPOINTS.FORM_TEMPLATES.BASE, data);
    return res.data;
  },
  update: async (id: number, data: Partial<FormTemplate>): Promise<FormTemplate> => {
    const res = await apiClient.put<{ data: FormTemplate }>(ENDPOINTS.FORM_TEMPLATES.BY_ID(id), data);
    return res.data;
  },
  delete: async (id: number) => {
    return apiClient.delete(ENDPOINTS.FORM_TEMPLATES.BY_ID(id));
  },
};