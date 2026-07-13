'use client';

import { useAuth } from '@/common/context/AuthContext';

export function usePermission(permission: string): boolean {
  const { isAdmin } = useAuth();
  if (!permission) return true;
  return isAdmin;
}

export function usePermissions(...permissions: string[]): boolean {
  const { isAdmin } = useAuth();
  if (permissions.length === 0) return true;
  return isAdmin;
}
