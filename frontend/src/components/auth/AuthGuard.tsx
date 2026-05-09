"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Role-based route authorization
    const adminOnlyPaths = ['/finance', '/creams', '/booking-history', '/form-templates', '/posizionamento', '/consensi'];
    const isAdminPath = adminOnlyPaths.some(p => pathname === p || pathname?.startsWith(p + '/'));

    if (isAdminPath && !isAdmin) {
      router.push('/');
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
        backgroundColor: '#060b13',
      }}>
        <CircularProgress
          size={50}
          thickness={4}
          sx={{
            color: '#00bfff',
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
  const adminOnlyPaths = ['/finance', '/creams', '/booking-history', '/form-templates', '/posizionamento', '/consensi'];
  const isAdminPath = adminOnlyPaths.some(p => pathname === p || pathname?.startsWith(p + '/'));
  if (isAdminPath && !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
