import type { Role } from '@/types/team';

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  USER: 'Utente',
  ARTIST: 'Artista',
};

export const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Admin' },
] as const;

export const SUPER_ADMIN_ONLY: Role[] = ['SUPER_ADMIN'];
export const ADMIN_AND_UP: Role[] = ['SUPER_ADMIN', 'ADMIN'];

/**
 * Verifica se l'utente è admin (ADMIN o SUPER_ADMIN)
 */
export function isAdmin(role: Role | null | undefined): boolean {
  if (!role) return false;
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

/**
 * Verifica se l'utente è super admin
 */
export function isSuperAdmin(role: Role | null | undefined): boolean {
  return role === 'SUPER_ADMIN';
}
