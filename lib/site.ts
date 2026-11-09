// The site's public URL, and the canonical and language URLs of each page.
// Used by the pages' metadata and by app/sitemap.ts, so the <head> tags and
// the sitemap can't disagree. See specs/0005-sitemap.

export const SITE_URL = 'https://http.cat';

export type Locale = 'en' | 'ca';

export type PageAlternates = {
  canonical: string;
  // only for pages that exist in both languages
  languages?: { en: string; ca: string; 'x-default': string };
};

export const absoluteUrl = (pathname: string) => `${SITE_URL}${pathname}`;

// The English path of a page, given its path in either language
// (e.g. `/ca/status/404` -> `/status/404`, `/ca` -> `/`).
const englishPath = (pathname: string) =>
  pathname === '/ca' ? '/' : pathname.replace(/^\/ca\//, '/');

const catalanPath = (pathname: string) => (pathname === '/' ? '/ca' : `/ca${pathname}`);

// Pages that exist in English and Catalan: the home page and the status pages.
const isTranslated = (pathname: string) => {
  const en = englishPath(pathname);
  return en === '/' || /^\/status\/\d+$/.test(en);
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
