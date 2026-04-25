'use client';

import { useEffect, useState } from 'react';

const BREAKPOINTS = {
  small: 400,
  medium: 768,
} as const;

export type ScreenSize = 'small' | 'medium' | 'large';

export interface Breakpoint {
  isSmall: boolean;
  isMedium: boolean;
  isLarge: boolean;
  size: ScreenSize;
}

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>({
    isSmall: true,
    isMedium: false,
    isLarge: false,
    size: 'small',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateBreakpoint = () => {
      const width = window.innerWidth;

      let isSmall = true;
      let isMedium = false;
      let isLarge = false;
      let size: ScreenSize = 'small';

      if (width >= BREAKPOINTS.medium) {
        isSmall = false;
        isMedium = false;
        isLarge = true;
        size = 'large';
      } else if (width >= BREAKPOINTS.small) {
        isSmall = false;
        isMedium = true;
        isLarge = false;
        size = 'medium';
      }

      setBreakpoint({ isSmall, isMedium, isLarge, size });
    };

    updateBreakpoint();

    const mediaQuerySmall = window.matchMedia(`(max-width: ${BREAKPOINTS.small - 1}px)`);
    const mediaQueryMedium = window.matchMedia(`(min-width: ${BREAKPOINTS.small}px) and (max-width: ${BREAKPOINTS.medium - 1}px)`);
    const mediaQueryLarge = window.matchMedia(`(min-width: ${BREAKPOINTS.medium}px)`);

    const handleChange = () => {
      updateBreakpoint();
    };

    mediaQuerySmall.addEventListener('change', handleChange);
    mediaQueryMedium.addEventListener('change', handleChange);
    mediaQueryLarge.addEventListener('change', handleChange);

    return () => {
      mediaQuerySmall.removeEventListener('change', handleChange);
      mediaQueryMedium.removeEventListener('change', handleChange);
      mediaQueryLarge.removeEventListener('change', handleChange);
    };
  }, []);

  return breakpoint;
}
