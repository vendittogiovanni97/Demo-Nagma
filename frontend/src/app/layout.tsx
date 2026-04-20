import type { Metadata } from 'next';
import { ToastContainer } from '@/components/ui/Toast/ToastContainer';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import GlobalErrorBoundary from '@/components/feedback/GlobalErrorBoundary';
import { branding } from '@/config/branding';
import './globals.css';

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
      <body className="font-sans antialiased text-text-primary">
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
        <ToastContainer />
      </body>
    </html>
  );
}
