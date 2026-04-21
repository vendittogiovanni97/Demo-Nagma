"use client";

import { useAuth } from '@/context/AuthContext';
import type { ReactNode } from 'react';

interface PermissionGateProps {
  requireAdmin?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

export default function PermissionGate({ requireAdmin = true, fallback = null, children }: PermissionGateProps) {
  const { isAdmin } = useAuth();
  return requireAdmin && isAdmin ? <>{children}</> : <>{fallback}</>;
}
