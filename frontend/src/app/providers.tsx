'use client';

import GlobalErrorBoundary from '@/components/feedback/GlobalErrorBoundary';
import LayoutContainer from '@/components/layout/LayoutContainer';
import Navbar from '@/components/layout/Navbar';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider as CustomThemeProvider } from '@/context/ThemeContext';
import { ToastContainer } from '@/components/ui/Toast/ToastContainer';
import theme from '@/theme/theme';
import { CssBaseline, ThemeProvider } from '@mui/material';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CustomThemeProvider>
        <AuthProvider>
          <GlobalErrorBoundary>
            <Navbar />
            <LayoutContainer maxWidth="full">
              {children}
            </LayoutContainer>
          </GlobalErrorBoundary>
        </AuthProvider>
      </CustomThemeProvider>
      <ToastContainer />
    </ThemeProvider>
  );
}
