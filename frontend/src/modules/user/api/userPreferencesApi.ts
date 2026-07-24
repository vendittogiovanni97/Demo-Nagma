import { apiClient } from '@/common/shared/api/client';
import { ENDPOINTS } from '@/common/shared/api/endpoints';

export interface UserPreferencesData {
  language: string;
  timezone: string;
  dateFormat: string;
  itemsPerPage: number;
  emailNotifications: boolean;
  inAppNotifications: boolean;
}

export const userPreferencesApi = {
  getPreferences: () =>
    apiClient.get<UserPreferencesData>(ENDPOINTS.USER_PREFERENCES.BASE),

  updatePreferences: (data: Partial<UserPreferencesData>) =>
    apiClient.patch<UserPreferencesData>(ENDPOINTS.USER_PREFERENCES.BASE, data),
};
