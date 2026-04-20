"use client";

import { useAuth } from '@/context/AuthContext';
import type { ReactNode } from 'react';

// `Permissions` interface from AuthContext has these keys:
// manageCustomers | manageStaff | manageShifts | manageFinance |
// manageWhatsAppTemplates | sendWhatsApp | manageFormTemplates

interface PermissionGateProps {
  permission: keyof ReturnType<typeof useAuth>['can'];
  fallback?: ReactNode;
  children: ReactNode;
}

export default function PermissionGate({ permission, fallback = null, children }: PermissionGateProps) {
  const { can } = useAuth();
  return can[permission] ? <>{children}</> : <>{fallback}</>;
}
