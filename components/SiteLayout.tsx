import { Metadata, Viewport } from 'next';
import Script from 'next/script';

import '@/app/globals.css';
import CarbonAd from '@/components/CarbonAd';
import { Locale, SITE_URL } from '@/lib/site';

// The markup and metadata every page shares. Rendered by the two root
// layouts, app/(en)/layout.tsx and app/(ca)/layout.tsx, which only differ in
// <html lang>. See specs/0005-sitemap.

export const siteMetadata: Metadata = {
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.png',
    apple: '/apple-touch-icon.png',
    other: [
      { rel: 'apple-touch-icon-precomposed', url: '/apple-touch-icon.png' },
    ],
  },
  title: 'HTTP Cats',
  description:
    'An API for the awesome HTTP Cats! Use it in your website to show funny error messages.',
  keywords:
    'http, cats, http cats, http status cats, status cats, api, lolcats, error',
  authors: [{ name: 'Rogério Vicente', url: 'https://github.com/rogeriopvl' }],
  openGraph: {
    type: 'website',
    title: 'HTTP Cats',
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/100.jpg`,
        alt: 'HTTP Cats',
      },
    ],
    siteName: 'HTTP Status Cats API',
    description: 'API for HTTP Cats',
  },
  twitter: {
    card: 'summary_large_image',
    site: SITE_URL,
    creator: '@rogeriopvl',
    title: 'HTTP Cats',
    description: 'API for HTTP Cats',
    images: [`${SITE_URL}/100`],
  },
};

export const siteViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#d0383e',
};

export default function SiteLayout({
  lang,
  children,
}: {
  lang: Locale;
  children: React.ReactNode;
}) {
  return (
    <html lang={lang}>
      {/* a root layout's <head>: the rule is for the Pages Router, and only
          fires because this file lives outside app/ */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <link
          rel="search"
          type="application/opensearchdescription+xml"
          title="httpcat"
          href={`${SITE_URL}/opensearch.xml`}
        />
      </head>
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
