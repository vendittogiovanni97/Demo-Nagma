'use client';

import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface Breakpoint {
  isSmall: boolean;  // sm e sotto
  isMedium: boolean; // md
  isLarge: boolean;  // lg (Laptop/Mac)
  isXLarge: boolean; // xl (Monitor grandi)
  size: ScreenSize;
}

/**
 * Hook per rilevare il breakpoint corrente usando il sistema nativo di MUI
 */
export function useBreakpoint(): Breakpoint {
  const theme = useTheme();

  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.only('lg'));
  const isXl = useMediaQuery(theme.breakpoints.up('xl'));

  // Calcolo della taglia testuale
  let size: ScreenSize = 'xs';
  if (isSm) size = 'sm';
  if (isMd) size = 'md';
  if (isLg) size = 'lg';
  if (isXl) size = 'xl';

  return {
    isSmall: isXs || isSm,
    isMedium: isMd,
    isLarge: isLg,
    isXLarge: isXl,
    size,
  };
}
