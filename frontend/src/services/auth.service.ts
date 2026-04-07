import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { LoginCredentials, RegisterData, AuthResponse } from '@/types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, credentials);
  },
  register: async (userData: RegisterData) => {
    return apiClient.post(ENDPOINTS.AUTH.REGISTER, userData);
  },
};
