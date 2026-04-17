import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { LoginCredentials, RegisterData, AuthResponse, AuthUser } from '@/types/auth';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, credentials);
  },
  me: async (): Promise<AuthUser> => {
    return apiClient.get<AuthUser>(ENDPOINTS.AUTH.ME);
  },
  register: async (userData: RegisterData) => {
    return apiClient.post(ENDPOINTS.AUTH.REGISTER, userData);
  },
  updateMe: async (data: { name?: string; phone?: string }): Promise<AuthUser> => {
    return apiClient.put<AuthUser>(ENDPOINTS.AUTH.ME, data);
  },
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    return apiClient.put<void>(`${ENDPOINTS.AUTH.ME}/password`, data);
  },
};
