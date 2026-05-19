import type { Metadata } from 'next';
import '@mantine/core/styles.css';
import './globals.css';
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';
import { Inter } from 'next/font/google';
import { theme } from '../theme';

const inter = Inter({ subsets: ['latin'] });
import { AuthProvider } from '@/contexts/AuthContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';

export const metadata: Metadata = {
  title: 'DearGiver — Every Giver Matters',
  description:
    'Discover verified charities in New Zealand, donate securely, and claim your 33.33% tax refund effortlessly. DearGiver makes giving transparent, easy, and rewarding.',
  keywords: ['donation', 'New Zealand', 'charity', 'tax refund', 'giving', 'community', 'Aotearoa', 'nonprofit', 'DearGiver'],
  openGraph: {
    title: 'DearGiver — Every Giver Matters',
    description:
      'Discover verified charities in New Zealand, donate securely, and claim your 33.33% tax refund effortlessly.',
    url: 'https://deargiver.co.nz',
    siteName: 'DearGiver',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DearGiver — Every Giver Matters',
      },
    ],
    locale: 'en_NZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DearGiver — Every Giver Matters',
    description:
      'Discover verified charities in New Zealand, donate securely, and claim your 33.33% tax refund effortlessly.',
    images: ['/images/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />

        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>
        <MantineProvider theme={theme}>
          <AuthProvider>
            <FavoritesProvider>
              {children}
            </FavoritesProvider>
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
