import type { Metadata } from 'next';
import '@mantine/core/styles.css';
import './globals.css';
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';
import { theme } from '../theme';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'Binding Minds — Connecting Hearts, Changing the World',
  description:
    'Discover verified charities in New Zealand, donate securely, and claim your 33.33% tax refund effortlessly. Binding Minds makes giving transparent, easy, and rewarding.',
  keywords: ['donation', 'New Zealand', 'charity', 'tax refund', 'giving', 'community', 'Aotearoa', 'nonprofit'],
  openGraph: {
    title: 'Binding Minds — Connecting Hearts, Changing the World',
    description:
      'Discover verified charities in New Zealand, donate securely, and claim your 33.33% tax refund effortlessly.',
    url: 'https://bindingminds.co.nz',
    siteName: 'Binding Minds',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Binding Minds — Connecting Hearts, Changing the World',
      },
    ],
    locale: 'en_NZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Binding Minds — Connecting Hearts, Changing the World',
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
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
