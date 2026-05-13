import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { AppProviders } from './providers';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '900'],
});

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
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
