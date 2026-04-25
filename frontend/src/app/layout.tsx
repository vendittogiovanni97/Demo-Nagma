'use client';

import GlobalErrorBoundary from '@/components/feedback/GlobalErrorBoundary';
import Navbar from '@/components/layout/Navbar';
import LayoutContainer from '@/components/layout/LayoutContainer';
import { ToastContainer } from '@/components/ui/Toast/ToastContainer';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import './globals.css';

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <GlobalErrorBoundary>
      <Navbar />
      {/* Layout responsivo con padding e max-width intelligente */}
      <LayoutContainer maxWidth="lg">
        {children}
      </LayoutContainer>
    </GlobalErrorBoundary>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="font-sans antialiased text-text-primary">
        <ThemeProvider>
          <AuthProvider>
            <RootLayoutContent>{children}</RootLayoutContent>
          </AuthProvider>
        </ThemeProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
