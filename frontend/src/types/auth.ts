import type { Role } from '@/types/team';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
