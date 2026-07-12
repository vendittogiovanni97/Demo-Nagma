'use client';

import { useBreakpoint, type Breakpoint, type ScreenSize } from '@/common/hooks/useBreakpoint';
import { createContext, ReactNode, useContext } from 'react';

interface BreakpointContextType extends Breakpoint {}

const BreakpointContext = createContext<BreakpointContextType | undefined>(undefined);

export function BreakpointProvider({ children }: { children: ReactNode }) {
  const breakpoint = useBreakpoint();

  return (
    <BreakpointContext.Provider value={breakpoint}>
      {children}
    </BreakpointContext.Provider>
  );
}

export function useBreakpointContext(): BreakpointContextType {
  const ctx = useContext(BreakpointContext);
  if (!ctx) {
    throw new Error('useBreakpointContext deve essere usato dentro BreakpointProvider');
  }
  return ctx;
}

export type { Breakpoint, ScreenSize };
