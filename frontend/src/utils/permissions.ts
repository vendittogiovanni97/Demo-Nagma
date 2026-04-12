import {
  CUSTOMER_MANAGEMENT_ROLES,
  FINANCE_MANAGEMENT_ROLES,
  INVENTORY_MANAGEMENT_ROLES,
  SHIFT_MANAGEMENT_ROLES,
  STAFF_MANAGEMENT_ROLES,
  WHATSAPP_SEND_ROLES,
  WHATSAPP_TEMPLATE_MANAGEMENT_ROLES,
} from '@/config/roles';
import type { Role } from '@/types/team';

export function hasRequiredRole(role: Role | null | undefined, allowedRoles: readonly Role[]) {
  if (!role) return false;
  return allowedRoles.includes(role);
}

export function canManageCustomers(role: Role | null | undefined) {
  return hasRequiredRole(role, CUSTOMER_MANAGEMENT_ROLES);
}

export function canManageStaff(role: Role | null | undefined) {
  return hasRequiredRole(role, STAFF_MANAGEMENT_ROLES);
}

export function canManageShifts(role: Role | null | undefined) {
  return hasRequiredRole(role, SHIFT_MANAGEMENT_ROLES);
}

export function canManageFinance(role: Role | null | undefined) {
  return hasRequiredRole(role, FINANCE_MANAGEMENT_ROLES);
}

export function canManageInventory(role: Role | null | undefined) {
  return hasRequiredRole(role, INVENTORY_MANAGEMENT_ROLES);
}

export function canManageWhatsAppTemplates(role: Role | null | undefined) {
  return hasRequiredRole(role, WHATSAPP_TEMPLATE_MANAGEMENT_ROLES);
}

export function canSendWhatsApp(role: Role | null | undefined) {
  return hasRequiredRole(role, WHATSAPP_SEND_ROLES);
}
