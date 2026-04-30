'use client';

import { Box, type SxProps, type Theme } from '@mui/material';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface LayoutContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  sx?: SxProps<Theme>;
}

export default function LayoutContainer({
  children,
  maxWidth = 'lg',
  sx,
}: LayoutContainerProps) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  const maxWidthMap = {
    sm: '640px',
    md: '840px',
    lg: '1280px',
    xl: '1440px',
    '2xl': '1600px',
    full: '100%',
  };

  return (
    <Box
      component="div"
      sx={{
        px: isAuthPage ? 2 : { xs: 1.25, sm: 2, md: 2.5, lg: 3, xl: 4 },
        pt: isAuthPage ? 0 : { xs: 10, sm: 11, md: 12 },
        pb: isAuthPage ? 0 : { xs: 2, sm: 2.5, md: 3 },
        width: '100%',
        maxWidth: maxWidthMap[maxWidth],
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: { xs: 'auto', md: '100vh' },
        overflowX: 'hidden',
        transition: 'padding 0.2s ease-in-out',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
