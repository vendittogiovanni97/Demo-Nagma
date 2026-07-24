import { apiClient } from '@/common/shared/api/client';
import { ENDPOINTS } from '@/common/shared/api/endpoints';

export type FilterOperator =
  | 'equals'
  | 'contains'
  | 'startsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'inRange'
  | 'isEmpty';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
  logic?: 'AND' | 'OR';
}

export interface SavedViewData {
  id: number;
  userId: number;
  module: string;
  name: string;
  filters: FilterCondition[];
  columns?: string[];
  sort?: { field: string; direction: 'asc' | 'desc' };
  isDefault: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export const savedViewApi = {
  getSavedViews: (moduleName: string) =>
    apiClient.get<SavedViewData[]>(ENDPOINTS.SAVED_VIEWS.BASE, { module: moduleName }),

  createSavedView: (data: Partial<SavedViewData>) =>
    apiClient.post<SavedViewData>(ENDPOINTS.SAVED_VIEWS.BASE, data),

  updateSavedView: (id: number, data: Partial<SavedViewData>) =>
    apiClient.patch<SavedViewData>(ENDPOINTS.SAVED_VIEWS.BY_ID(id), data),

  deleteSavedView: (id: number) =>
    apiClient.delete<void>(ENDPOINTS.SAVED_VIEWS.BY_ID(id)),

  setDefault: (id: number) =>
    apiClient.patch<SavedViewData>(ENDPOINTS.SAVED_VIEWS.SET_DEFAULT(id)),
};
