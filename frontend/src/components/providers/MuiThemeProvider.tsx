"use client";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/theme/theme";
import { type ReactNode } from "react";

/**
 * MUI Theme Provider
 * Fornisce il tema dark personalizzato a tutta l'applicazione
 *
 * Utilizzo nel layout principale:
 * <MuiThemeProvider>
 *   {children}
 * </MuiThemeProvider>
 */

interface MuiThemeProviderProps {
  children: ReactNode;
}

export default function MuiThemeProvider({ children }: MuiThemeProviderProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
