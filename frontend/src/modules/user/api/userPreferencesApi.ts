import { API_BASE_URL, ENDPOINTS } from '@/common/shared/api/endpoints';
import { getToken } from '@/common/shared/utils/auth';

export interface UserPreferencesData {
  language: string;
  timezone: string;
  dateFormat: string;
  itemsPerPage: number;
  emailNotifications: boolean;
  inAppNotifications: boolean;
}

export const userPreferencesApi = {
  getPreferences: async (): Promise<UserPreferencesData> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.USER_PREFERENCES.BASE}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Impossibile caricare le preferenze utente');
    }

    return response.json();
  },

  updatePreferences: async (data: Partial<UserPreferencesData>): Promise<UserPreferencesData> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.USER_PREFERENCES.BASE}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Impossibile aggiornare le preferenze utente');
    }

    return response.json();
  },
};
