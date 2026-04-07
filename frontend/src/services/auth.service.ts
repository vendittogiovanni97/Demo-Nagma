import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import { User } from '@/types/customer';

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  login: (credentials: LoginPayload): Promise<AuthResponse> =>
    apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials),

  register: (data: Omit<User, 'id'> & { password: string }) =>
    apiClient.post(ENDPOINTS.AUTH.REGISTER, data),
};
