'use client';

import React, { useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useClientConfig } from '@/common/hooks/useClientConfig';
import { createDynamicTheme } from '@/common/theme/createDynamicTheme';
import theme from '@/common/theme/theme'; // default theme

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Provider che applica il tema dinamico basato su ClientConfig
 * Fallback al tema statico se ClientConfig non è disponibile
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { clientConfig, isLoading } = useClientConfig();

  // Crea tema dinamico basato su clientConfig
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
};

export default ThemeProvider;
