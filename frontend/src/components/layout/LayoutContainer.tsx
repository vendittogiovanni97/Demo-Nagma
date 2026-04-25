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
  // Mapping dei maxWidth values
  const maxWidthMap = {
    sm: '640px',      // sm breakpoint
    md: '768px',      // md breakpoint
    lg: '1024px',     // lg breakpoint (1280px in Tailwind)
    xl: '1280px',     // xl breakpoint
    '2xl': '1536px',  // 2xl breakpoint
    full: '100%',     // full width con padding
  };

  return (
    <Box
      component="div"
      sx={{
        // Padding responsivo
        px: { xs: 1, sm: 1.5, md: 2, lg: 3 },
        py: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },

        // Width e centering
        width: '100%',
        maxWidth: maxWidthMap[maxWidth],
        mx: 'auto',

        // Flex layout
        display: 'flex',
        flexDirection: 'column',

        // Overflow
        overflowX: 'hidden',

        // Transizioni smooth (opzionale)
        transition: 'all 0.3s ease-in-out',

        // Merge con sx custom
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
