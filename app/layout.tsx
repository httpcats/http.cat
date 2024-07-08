import { Metadata } from 'next';
import Script from 'next/script';

import './globals.css';
import CarbonAd from '@/components/CarbonAd';

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.png',
    apple: '/apple-touch-icon.png',
    other: [
      { rel: 'apple-touch-icon-precomposed', url: '/apple-touch-icon.png' },
    ],
  },
  viewport: 'width=device-width, initial-scale=1',
  title: 'HTTP Cats',
  description:
    'An API for the awesome HTTP Cats! Use it in your website to show funny error messages.',
  keywords:
    'http, cats, http cats, http status cats, status cats, api, lolcats, error',
  authors: [{ name: 'Rogério Vicente', url: 'https://github.com/rogeriopvl' }],
  openGraph: {
    type: 'website',
    title: 'HTTP Cats',
    url: 'https://http.cat',
    images: [
      {
        url: 'https://http.cat/100.jpg',
        alt: 'HTTP Cats',
      },
    ],
    siteName: 'HTTP Status Cats API',
    description: 'API for HTTP Cats',
  },
  twitter: {
    card: 'summary_large_image',
    site: 'https://http.cat',
    creator: '@rogeriopvl',
    title: 'HTTP Cats',
    description: 'API for HTTP Cats',
    images: ['https://http.cat/100'],
  },
  themeColor: '#d0383e',
  manifest: '/manifest.json',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CarbonAd />
        <div className="p-4 sm:px-16 sm:py-4 lg:px-32 lg:py-4">{children}</div>
        <Script id="google-analytics" strategy="afterInteractive">
          {`
          window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
          ga('create', 'UA-27701865-1', 'auto');
          ga('send', 'pageview');
        `}
        </Script>
        <Script
          src="https://www.google-analytics.com/analytics.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
