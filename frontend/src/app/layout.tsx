import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
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
        <AuthProvider>
          <GlobalErrorBoundary>
            <Navbar />
            <main className="px-[2%] min-h-screen flex flex-col pt-29">
              {children}
            </main>
          </GlobalErrorBoundary>
        </AuthProvider>

        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#0a0a0a',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#00BFFF', secondary: '#0a0a0a' } },
            error:   { iconTheme: { primary: '#ff5252', secondary: '#0a0a0a' } },
          }}
        />
      </body>
    </html>
  );
}
