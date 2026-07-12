"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/common/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, isAdmin, isSuperAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Role-based route authorization
    const adminOnlyPaths = ['/finance', '/creams', '/booking-history', '/form-templates', '/posizionamento', '/consensi', '/admin-panel'];
    const isAdminPath = adminOnlyPaths.some(p => pathname === p || pathname?.startsWith(p + '/'));

    if (isAdminPath && !isAdmin) {
      router.push('/');
      return;
    }

    if ((pathname === '/admin-panel' || pathname?.startsWith('/admin-panel/')) && !isSuperAdmin) {
      router.push('/');
      return;
    }
  }, [isAuthenticated, isLoading, isAdmin, pathname, router]);

  if (isLoading) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'screen',
        height: '100vh',
        backgroundColor: 'background.default',
      }}>
        <CircularProgress
          size={50}
          thickness={4}
          sx={{
            color: 'primary.main',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            }
          }}
        />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Role check fallback to avoid content flash during redirect
  const adminOnlyPaths = ['/finance', '/creams', '/booking-history', '/form-templates', '/posizionamento', '/consensi', '/admin-panel'];
  const isAdminPath = adminOnlyPaths.some(p => pathname === p || pathname?.startsWith(p + '/'));
  if (isAdminPath && !isAdmin) {
    return null;
  }
  if ((pathname === '/admin-panel' || pathname?.startsWith('/admin-panel/')) && !isSuperAdmin) {
    return null;
  }

  return <>{children}</>;
}
