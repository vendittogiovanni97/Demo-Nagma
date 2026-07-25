import { apiClient } from '@/common/shared/api/client';
import { ENDPOINTS } from '@/common/shared/api/endpoints';

export interface CustomField {
  id: string;
  entityType: string;
  fieldName: string;
  fieldType: 'string' | 'number' | 'boolean' | 'date' | 'select' | 'multiselect';
  fieldLabel: string;
  isRequired: boolean;
  options?: Record<string, string>;
  defaultValue?: any;
  clientId: number;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomFieldPayload {
  entityType: string;
  fieldName: string;
  fieldType: CustomField['fieldType'];
  fieldLabel: string;
  isRequired?: boolean;
  options?: Record<string, string>;
  defaultValue?: any;
}

export interface UpdateCustomFieldPayload {
  fieldLabel?: string;
  fieldType?: CustomField['fieldType'];
  isRequired?: boolean;
  options?: Record<string, string>;
  defaultValue?: any;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export const customFieldService = {
  getAll: async (entityType?: string): Promise<CustomField[]> => {
    const params = entityType ? { entityType } : {};
    const response = await apiClient.get<{ success: boolean; data: CustomField[] }>(
      ENDPOINTS.CUSTOM_FIELDS.BASE,
      params
    );
    return response.data;
  },

  getById: async (id: string): Promise<CustomField> => {
    const response = await apiClient.get<{ success: boolean; data: CustomField }>(
      ENDPOINTS.CUSTOM_FIELDS.BY_ID(id)
    );
    return response.data;
  },

  create: async (payload: CreateCustomFieldPayload): Promise<CustomField> => {
    const response = await apiClient.post<{ success: boolean; data: CustomField }>(
      ENDPOINTS.CUSTOM_FIELDS.BASE,
      payload
    );
    return response.data;
  },

  update: async (id: string, payload: UpdateCustomFieldPayload): Promise<CustomField> => {
    const response = await apiClient.put<{ success: boolean; data: CustomField }>(
      ENDPOINTS.CUSTOM_FIELDS.BY_ID(id),
      payload
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.CUSTOM_FIELDS.BY_ID(id));
  },

  validate: async (entityType: string, customData: Record<string, any>): Promise<ValidationResult> => {
    const response = await apiClient.post<{ success: boolean; data: ValidationResult }>(
      ENDPOINTS.CUSTOM_FIELDS.VALIDATE,
      { entityType, customData }
    );
    return response.data;
  },
};