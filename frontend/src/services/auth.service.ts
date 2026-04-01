import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';

export const authService = {
  login: async (credentials: any) => {
    return apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
  },
  register: async (userData: any) => {
    return apiClient.post(ENDPOINTS.AUTH.REGISTER, userData);
  },
};
