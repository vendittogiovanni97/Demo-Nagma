'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useClientConfig, DEFAULT_CLIENT_CONFIG } from '@/common/hooks/useClientConfig';
import { createDynamicTheme } from '@/common/theme/createDynamicTheme';
import theme from '@/common/theme/theme'; // default theme
import { ThemeModeProvider, useThemeMode } from '@/common/context/ThemeModeContext';

/**
 * Inner component che usa useClientConfig e useThemeMode.
 * Rende il tema MUI reattivo al toggle dark/light/system.
 */
function DynamicThemeProvider({ children }: { children: React.ReactNode }) {
  const { clientConfig, isLoading } = useClientConfig();
  const { resolvedTheme } = useThemeMode();

  const currentTheme = useMemo(() => {
    return createDynamicTheme(clientConfig, resolvedTheme);
  }, [clientConfig, resolvedTheme]);

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
 * Outer provider che gestisce SSR/hydration:
 * - Prima del mount: usa tema statico dark (default) per evitare flash
 * - Dopo il mount: usa ThemeModeProvider + DynamicThemeProvider reattivi
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Durante SSR e primo render client usa il tema statico default
  if (!mounted) {
    const defaultTheme = createDynamicTheme(DEFAULT_CLIENT_CONFIG, 'dark');
    return (
      <MuiThemeProvider theme={defaultTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    );
  }

  // Dopo l'hydration: ThemeModeProvider avvolge DynamicThemeProvider
  return (
    <ThemeModeProvider>
      <DynamicThemeProvider>{children}</DynamicThemeProvider>
    </ThemeModeProvider>
  );
};

export default ThemeProvider;