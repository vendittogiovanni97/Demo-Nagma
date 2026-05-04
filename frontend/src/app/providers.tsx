'use client';

import { usePathname } from 'next/navigation';

import GlobalErrorBoundary from '@/components/feedback/GlobalErrorBoundary';
import LayoutContainer from '@/components/layout/LayoutContainer';

import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider as CustomThemeProvider } from '@/context/ThemeContext';
import { ToastContainer } from '@/components/ui/Toast/ToastContainer';
import theme from '@/theme/theme';
import { ThemeProvider } from '@mui/material';

import dynamic from 'next/dynamic';

const Navbar = dynamic(() => import('@/components/layout/Navbar'), { ssr: false });
const ClientCssBaseline = dynamic(() => import('@mui/material/CssBaseline'), { ssr: false });

export function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <ThemeProvider theme={theme}>
      <ClientCssBaseline />
      <CustomThemeProvider>
        <AuthProvider>
          <GlobalErrorBoundary>
            <div className="flex flex-col min-h-screen">
              {!isAuthPage && <Navbar />}
              {isAuthPage ? (
                children
              ) : (
                <LayoutContainer maxWidth="full">
                  {children}
                </LayoutContainer>
              )}
            </div>
          </GlobalErrorBoundary>
        </AuthProvider>
      </CustomThemeProvider>
      <ToastContainer />
    </ThemeProvider>
  );
}
