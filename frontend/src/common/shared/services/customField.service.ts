import { apiClient } from '@/common/shared/api/client';
import { ENDPOINTS } from '@/common/shared/api/endpoints';

export interface CustomField {
  id: string;
  entityType: string; // "customer" | "booking" | etc.
  fieldName: string;
  fieldType: string; // "string" | "number" | "boolean" | "date" | "select" | "multiselect"
  fieldLabel: string;
  isRequired: boolean;
  options?: any;
  defaultValue?: any;
  clientId: number;
  createdAt: string;
  updatedAt: string;
}

export const customFieldService = {
  getAll: async (entityType?: string) => {
    const url = entityType ? `${ENDPOINTS.CUSTOM_FIELDS.BASE}?entityType=${entityType}` : ENDPOINTS.CUSTOM_FIELDS.BASE;
    return apiClient.get<{ success: boolean; data: CustomField[] }>(url);
  },

  getById: async (id: string) => {
    return apiClient.get<{ success: boolean; data: CustomField }>(ENDPOINTS.CUSTOM_FIELDS.BY_ID(id));
  },

  create: async (data: Omit<CustomField, 'id' | 'clientId' | 'createdAt' | 'updatedAt'>) => {
    return apiClient.post<{ success: boolean; data: CustomField }>(ENDPOINTS.CUSTOM_FIELDS.BASE, data);
  },

  update: async (id: string, data: Partial<Omit<CustomField, 'id' | 'clientId' | 'createdAt' | 'updatedAt'>>) => {
    return apiClient.put<{ success: boolean; data: CustomField }>(ENDPOINTS.CUSTOM_FIELDS.BY_ID(id), data);
  },

  delete: async (id: string) => {
    return apiClient.delete<{ success: boolean; message: string }>(ENDPOINTS.CUSTOM_FIELDS.BY_ID(id));
  },

  validate: async (entityType: string, customData: Record<string, any>) => {
    return apiClient.post<{ success: boolean; data: { valid: boolean; errors: string[] } }>(
      ENDPOINTS.CUSTOM_FIELDS.VALIDATE,
      { entityType, customData }
    );
  },
};
