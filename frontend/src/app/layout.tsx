import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './globals.css';
import { AppProviders } from './providers';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { BROWSER_THEME_COLOR } from '@/common/theme/colorTokens';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: 'variable',
  preload: false,
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: BROWSER_THEME_COLOR,
};

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_PORTAL_NAME || 'Nagma Tattoo CRM',
  description:
    process.env.NEXT_PUBLIC_PORTAL_DESCRIPTION ||
    'Gestionale completo per prenotazioni, clienti e agenda del tuo studio tattoo.',
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${outfit.variable} ${outfit.className} antialiased`}
        suppressHydrationWarning
      >
        <AppRouterCacheProvider>
          <AppProviders>{children}</AppProviders>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
