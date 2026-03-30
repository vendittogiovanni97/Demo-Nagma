import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'Nagma Tattoo | CRM',
  description: 'Gestionale Completo Nagma Tattoo Studio',
};

import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased text-text-primary`}>
        <Navbar />
        <main className="pt-8 px-[5%] pb-8 min-h-screen flex flex-col pt-[100px]">
          {children}
        </main>

        <Toaster 
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#0a0a0a',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              fontFamily: 'Inter, sans-serif'
            },
            success: {
              iconTheme: { primary: '#00BFFF', secondary: '#0a0a0a' },
            },
            error: {
              iconTheme: { primary: '#ff5252', secondary: '#0a0a0a' },
            }
          }}
        />
      </body>
    </html>
  );
}
