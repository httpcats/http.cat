// The site's public URL and name, the canonical and language URLs of each
// page, and the Open Graph and X card tags built from them. Used by the
// pages' metadata and by app/sitemap.ts, so the <head> tags and the sitemap
// can't disagree. See specs/0005-sitemap.

import type { Metadata } from 'next';

export const SITE_URL = 'https://http.cat';
export const SITE_NAME = 'HTTP Cats';

export type Locale = 'en' | 'ca';

export type PageAlternates = {
  canonical: string;
  // only for pages that exist in both languages
  languages?: { en: string; ca: string; 'x-default': string };
};

// The X (Twitter) card of every page, set once in the root layouts. Its title,
// description and image (with the image's alt text) aren't set here: Next
// copies them from the page's openGraph metadata (see openGraphFor), so the
// two can't disagree.
export const twitterCard = {
  card: 'summary_large_image',
  site: '@rogeriopvl',
  creator: '@rogeriopvl',
} as const;

export const absoluteUrl = (pathname: string) => `${SITE_URL}${pathname}`;

// The about page in each language (specs/0007-about-page)
export const aboutPath = (locale: Locale) => (locale === 'ca' ? '/ca/about' : '/about');

// The English path of a page, given its path in either language
// (e.g. `/ca/status/404` -> `/status/404`, `/ca` -> `/`).
const englishPath = (pathname: string) =>
  pathname === '/ca' ? '/' : pathname.replace(/^\/ca\//, '/');

const catalanPath = (pathname: string) => (pathname === '/' ? '/ca' : `/ca${pathname}`);

// Pages that exist in English and Catalan: the home page, the status pages
// and the about page (specs/0007-about-page).
const isTranslated = (pathname: string) => {
  const en = englishPath(pathname);
  return en === '/' || en === '/about' || /^\/status\/\d+$/.test(en);
};

// The path of a page in `locale`: the same page if it's translated, else that
// language's home page (e.g. the blog, which is English only). Used by the
// `:lang` command, see specs/0006-keyboard-navigation.
export function pathInLanguage(pathname: string, locale: Locale): string {
  if (!isTranslated(pathname)) return locale === 'ca' ? '/ca' : '/';
  const en = englishPath(pathname);
  return locale === 'ca' ? catalanPath(en) : en;
}

export function alternatesFor(pathname: string): PageAlternates {
  const canonical = absoluteUrl(pathname);
  if (!isTranslated(pathname)) return { canonical };

  const en = absoluteUrl(englishPath(pathname));
  const ca = absoluteUrl(catalanPath(englishPath(pathname)));
  return { canonical, languages: { en, ca, 'x-default': en } };
}

const OG_LOCALES: Record<Locale, string> = { en: 'en_US', ca: 'ca_ES' };

type OpenGraphPage = {
  // the page's path, for og:url; omitted for pages with no canonical URL
  // (the not-found page)
  pathname?: string;
  locale: Locale;
  title: string;
  description: string;
  type?: 'website' | 'article';
  // for articles (blog posts): their date, as YYYY-MM-DD
  publishedTime?: string;
  // defaults to the 100 Continue cat
  image?: { url: string; alt: string };
};

// The Open Graph tags of a page, which link previews (and the X card) use.
// Every page sets all of them: a page's openGraph replaces the layout's
// whole, so a shared default would leave pages with missing or wrong fields.
export function openGraphFor({
  pathname,
  locale,
  title,
  description,
  type = 'website',
  publishedTime,
  image = { url: absoluteUrl('/100.jpg'), alt: SITE_NAME },
}: OpenGraphPage): NonNullable<Metadata['openGraph']> {
  const other: Locale = locale === 'ca' ? 'en' : 'ca';
  const translated = pathname !== undefined && alternatesFor(pathname).languages !== undefined;
  return {
    type,
    siteName: SITE_NAME,
    locale: OG_LOCALES[locale],
    ...(translated && { alternateLocale: OG_LOCALES[other] }),
    title,
    description,
    ...(pathname !== undefined && { url: alternatesFor(pathname).canonical }),
    images: [image],
    ...(publishedTime !== undefined && { publishedTime }),
  };
}
