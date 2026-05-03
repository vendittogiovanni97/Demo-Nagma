import { UserRole } from '../domain/User';

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

export interface UpdateMeDTO {
  name?: string;
  phone?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponseDTO {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
  };
}
