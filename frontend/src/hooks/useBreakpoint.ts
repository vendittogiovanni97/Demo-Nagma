'use client';

import { useEffect, useState } from 'react';

export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface Breakpoint {
  isSmall: boolean;
  isMedium: boolean;
  isLarge: boolean;
  size: ScreenSize;
}

/**
 * Hook to detect current screen breakpoint
 * Consolidated multiple MediaQuery listeners into single useEffect with proper cleanup
 * This prevents memory leaks from orphaned listeners and reduces redundant queries
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>({
    isSmall: false,
    isMedium: false,
    isLarge: false,
    size: 'md',
  });

  useEffect(() => {
    // Define media queries
    const smallQuery = window.matchMedia('(max-width: 640px)');
    const mediumQuery = window.matchMedia('(max-width: 1024px)');
    const largeQuery = window.matchMedia('(max-width: 1280px)');

    const updateBreakpoint = () => {
      const isSmall = smallQuery.matches;
      const isMedium = mediumQuery.matches;
      const isLarge = largeQuery.matches;

      // Determine screen size
      let size: ScreenSize;
      if (isSmall) {
        size = 'xs';
      } else if (isMedium && !isSmall) {
        size = 'sm';
      } else if (isLarge && !isMedium) {
        size = 'md';
      } else {
        size = 'lg';
      }

      setBreakpoint({
        isSmall,
        isMedium,
        isLarge,
        size,
      });
    };

    // Set initial state
    updateBreakpoint();

    // Add listeners with cleanup
    smallQuery.addEventListener('change', updateBreakpoint);
    mediumQuery.addEventListener('change', updateBreakpoint);
    largeQuery.addEventListener('change', updateBreakpoint);

    // Cleanup all listeners in single effect
    return () => {
      smallQuery.removeEventListener('change', updateBreakpoint);
      mediumQuery.removeEventListener('change', updateBreakpoint);
      largeQuery.removeEventListener('change', updateBreakpoint);
    };
  }, []);

  return breakpoint;
}
