'use client';

import { useBreakpoint, type Breakpoint, type ScreenSize } from '@/hooks/useBreakpoint';
import { createContext, ReactNode, useContext } from 'react';

interface ThemeContextType extends Breakpoint {}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const breakpoint = useBreakpoint();

  return (
    <ThemeContext.Provider value={breakpoint}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme deve essere usato dentro ThemeProvider');
  }
  return ctx;
}

export type { Breakpoint, ScreenSize };
