import { API_BASE_URL, ENDPOINTS } from '@/common/shared/api/endpoints';
import { getToken } from '@/common/shared/utils/auth';

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
  getSavedViews: async (moduleName: string): Promise<SavedViewData[]> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.SAVED_VIEWS.BASE}?module=${encodeURIComponent(moduleName)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Impossibile caricare le viste salvate');
    }

    return response.json();
  },

  createSavedView: async (data: Partial<SavedViewData>): Promise<SavedViewData> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.SAVED_VIEWS.BASE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Impossibile salvare la nuova vista');
    }

    return response.json();
  },

  updateSavedView: async (id: number, data: Partial<SavedViewData>): Promise<SavedViewData> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.SAVED_VIEWS.BY_ID(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Impossibile aggiornare la vista salvata');
    }

    return response.json();
  },

  deleteSavedView: async (id: number): Promise<void> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.SAVED_VIEWS.BY_ID(id)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Impossibile eliminare la vista salvata');
    }
  },

  setDefault: async (id: number): Promise<SavedViewData> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.SAVED_VIEWS.SET_DEFAULT(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Impossibile impostare la vista come predefinita');
    }

    return response.json();
  },
};
