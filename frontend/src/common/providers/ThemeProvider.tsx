'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useClientConfig, DEFAULT_CLIENT_CONFIG } from '@/common/hooks/useClientConfig';
import { createDynamicTheme } from '@/common/theme/createDynamicTheme';
import theme from '@/common/theme/theme'; // default theme

/**
 * Inner component that uses useClientConfig - only renders after hydration
 */
function DynamicThemeProvider({ children }: { children: React.ReactNode }) {
  const { clientConfig, isLoading } = useClientConfig();

  const currentTheme = useMemo(() => {
    return createDynamicTheme(clientConfig);
  }, [clientConfig]);

  if (isLoading) {
    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    );
  }

  return (
    <MuiThemeProvider theme={currentTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

/**
 * Outer provider that handles SSR/hydration - renders static theme first,
 * then swaps to dynamic theme after hydration
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and first client render (before hydration), use static default theme
  if (!mounted) {
    const defaultTheme = createDynamicTheme(DEFAULT_CLIENT_CONFIG);
    return (
      <MuiThemeProvider theme={defaultTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    );
  }

  // After hydration, render the dynamic theme provider
  return <DynamicThemeProvider>{children}</DynamicThemeProvider>;
};

export default ThemeProvider;