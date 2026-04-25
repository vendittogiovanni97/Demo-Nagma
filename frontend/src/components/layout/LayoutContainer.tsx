'use client';

import { Box, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';

interface LayoutContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  sx?: SxProps<Theme>;
}

/**
 * LayoutContainer — Componente di contenimento responsivo con MUI
 *
 * Fornisce:
 * - Padding responsivo (xs: 1rem, sm: 1.5rem, md: 2rem, lg: 3rem)
 * - Max-width intelligente (default: lg = 1280px)
 * - Centering automatico
 * - Gestione corretta del navbar fixed
 *
 * @example
 * ```tsx
 * <LayoutContainer maxWidth="lg">
 *   {children}
 * </LayoutContainer>
 * ```
 */
export default function LayoutContainer({
  children,
  maxWidth = 'lg',
  sx,
}: LayoutContainerProps) {
  const maxWidthMap = {
    sm: '640px',
    md: '840px',
    lg: '1120px',
    xl: '1280px',
    '2xl': '1440px',
    full: '100%',
  };

  return (
    <Box
      component="div"
      sx={{
        px: { xs: 1.25, sm: 2, md: 2.5, lg: 3 },
        pt: { xs: 10, sm: 11, md: 12 },
        pb: { xs: 2, sm: 2.5, md: 3 },
        width: '100%',
        maxWidth: maxWidthMap[maxWidth],
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        overflowX: 'hidden',
        transition: 'padding 0.2s ease-in-out',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
