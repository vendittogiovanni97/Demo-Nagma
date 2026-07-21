'use client';

import { usePathname } from 'next/navigation';

import GlobalErrorBoundary from '@/common/components/feedback/GlobalErrorBoundary';
import LayoutContainer from '@/common/components/layout/LayoutContainer';

import { AuthProvider } from '@/common/context/AuthContext';
import { PreferencesProvider } from '@/common/context/PreferencesContext';
import { BreakpointProvider as CustomBreakpointProvider } from '@/common/context/BreakpointContext';
import { ToastContainer } from '@/common/components/ui/Toast/ToastContainer';
import DynamicThemeProvider from '@/common/providers/ThemeProvider';

import dynamic from 'next/dynamic';
import AuthGuard from '@/common/components/auth/AuthGuard';

const Navbar = dynamic(() => import('@/common/components/layout/Navbar'), { ssr: false });
export function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalonePage = pathname === '/login' || pathname === '/register' || pathname?.startsWith('/consenso');

  return (
    <DynamicThemeProvider>
      <CustomBreakpointProvider>
        <AuthProvider>
          <PreferencesProvider>
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
          </PreferencesProvider>
        </AuthProvider>
      </CustomBreakpointProvider>
      <ToastContainer />
    </DynamicThemeProvider>
  );
}
