'use client';

import { usePathname } from 'next/navigation';

import GlobalErrorBoundary from '@/common/components/feedback/GlobalErrorBoundary';
import LayoutContainer from '@/common/components/layout/LayoutContainer';

import { AuthProvider } from '@/common/context/AuthContext';
import { BreakpointProvider as CustomBreakpointProvider } from '@/common/context/BreakpointContext';
import { ToastContainer } from '@/common/components/ui/Toast/ToastContainer';
import theme from '@/common/theme/theme';
import { ThemeProvider } from '@mui/material';

import dynamic from 'next/dynamic';
import AuthGuard from '@/common/components/auth/AuthGuard';

const Navbar = dynamic(() => import('@/common/components/layout/Navbar'), { ssr: false });
const ClientCssBaseline = dynamic(() => import('@mui/material/CssBaseline'), { ssr: false });

export function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalonePage = pathname === '/login' || pathname === '/register' || pathname?.startsWith('/consenso');

  return (
    <ThemeProvider theme={theme}>
      <ClientCssBaseline />
      <CustomBreakpointProvider>
        <AuthProvider>
          <GlobalErrorBoundary>
            <div className="flex flex-col min-h-screen">
              {!isStandalonePage && <Navbar />}
              {isStandalonePage ? (
                children
              ) : (
                <AuthGuard>
                  <LayoutContainer maxWidth="full">
                    {children}
                  </LayoutContainer>
                </AuthGuard>
              )}
            </div>
          </GlobalErrorBoundary>
        </AuthProvider>
      </CustomBreakpointProvider>
      <ToastContainer />
    </ThemeProvider>
  );
}
