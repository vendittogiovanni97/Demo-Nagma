import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { ToastProvider } from '@/components/ui/Toast/ToastContext';
import { ToastContainer } from '@/components/ui/Toast/ToastContainer';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import GlobalErrorBoundary from '@/components/feedback/GlobalErrorBoundary';
import { branding } from '@/config/branding';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: branding.portalName,
  description: branding.portalDescription,
  icons: {
    icon: branding.portalLogo,
    shortcut: branding.portalLogo,
    apple: branding.portalLogo,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased text-text-primary`}>
        {/* ============ BEGIN: TOAST SYSTEM INTEGRATION ============ */}
        <ToastProvider>
          {/* ============ END: TOAST PROVIDER WRAPPER START ============ */}
          <AuthProvider>
            <GlobalErrorBoundary>
              <Navbar />
              <div className="min-h-screen flex flex-col pt-24">
                <main className="px-[2%] flex-1 flex flex-col">
                  {children}
                </main>
              </div>
            </GlobalErrorBoundary>
          </AuthProvider>

          {/* ============ BEGIN: TOAST CONTAINER (inside ToastProvider) ============ */}
          <ToastContainer />
          {/* ============ END: TOAST CONTAINER ============ */}
        </ToastProvider>
        {/* ============ END: TOAST SYSTEM INTEGRATION ============ */}
      </body>
    </html>
  );
}
