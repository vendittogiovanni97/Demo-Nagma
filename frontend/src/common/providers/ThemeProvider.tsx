'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useClientConfig, DEFAULT_CLIENT_CONFIG } from '@/common/hooks/useClientConfig';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Crea tema dinamico basato su clientConfig
  const currentTheme = useMemo(() => {
    return createDynamicTheme(clientConfig);
  }, [clientConfig]);

  // Durante la prima renderizzazione (SSR e primo avvio client), usa sempre il tema di default (DEFAULT_CLIENT_CONFIG)
  // per prevenire hydration mismatch
  if (!mounted) {
    const defaultTheme = createDynamicTheme(DEFAULT_CLIENT_CONFIG);
    return (
      <MuiThemeProvider theme={defaultTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    );
  }

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
