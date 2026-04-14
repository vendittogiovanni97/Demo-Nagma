import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { FormTemplate, CreateFormTemplateData } from '@/types/form-template';

export const formTemplateService = {
  getAll: async (): Promise<FormTemplate[]> => {
    return apiClient.get<FormTemplate[]>(ENDPOINTS.FORM_TEMPLATES.BASE);
  },
  getById: async (id: string): Promise<FormTemplate> => {
    return apiClient.get<FormTemplate>(ENDPOINTS.FORM_TEMPLATES.BY_ID(id));
  },
  create: async (data: CreateFormTemplateData): Promise<FormTemplate> => {
    return apiClient.post<FormTemplate>(ENDPOINTS.FORM_TEMPLATES.BASE, data);
  },
  update: async (id: string, data: Partial<CreateFormTemplateData>): Promise<FormTemplate> => {
    return apiClient.put<FormTemplate>(ENDPOINTS.FORM_TEMPLATES.BY_ID(id), data);
  },
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(ENDPOINTS.FORM_TEMPLATES.BY_ID(id));
  },
};
