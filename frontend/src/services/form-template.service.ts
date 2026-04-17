import { createCrudService } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { FormTemplate } from '@/types/form-template';

export const formTemplateService = {
  ...createCrudService<FormTemplate>(ENDPOINTS.FORM_TEMPLATES.BASE, ENDPOINTS.FORM_TEMPLATES.BY_ID),
};
