import type { Role } from '@/types/team';

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  USER: 'Segreteria',
  ARTIST: 'Artist',
};

export const ROLE_OPTIONS = [
  { value: 'ARTIST', label: 'Tatuatore (Artist)' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'USER', label: 'Assistente / Segreteria' },
] as const;

export const STAFF_MANAGEMENT_ROLES: Role[] = ['ADMIN', 'SUPER_ADMIN'];
export const SHIFT_MANAGEMENT_ROLES: Role[] = ['ADMIN', 'USER', 'SUPER_ADMIN'];
export const FINANCE_MANAGEMENT_ROLES: Role[] = ['ADMIN', 'USER', 'SUPER_ADMIN'];
export const INVENTORY_MANAGEMENT_ROLES: Role[] = ['ADMIN', 'USER', 'SUPER_ADMIN'];
export const CUSTOMER_MANAGEMENT_ROLES: Role[] = ['ADMIN', 'USER', 'SUPER_ADMIN'];
export const WHATSAPP_TEMPLATE_MANAGEMENT_ROLES: Role[] = ['ADMIN', 'USER', 'SUPER_ADMIN'];
export const WHATSAPP_SEND_ROLES: Role[] = ['ADMIN', 'USER', 'SUPER_ADMIN'];
export const FORM_TEMPLATE_MANAGEMENT_ROLES: Role[] = ['SUPER_ADMIN'];
