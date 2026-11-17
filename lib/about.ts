import { readFileSync } from 'fs';
import type { Metadata } from 'next';

import { renderMarkdown } from './markdown';
import { aboutPath, absoluteUrl, alternatesFor, type Locale } from './site';
import { getTranslations } from './translation';

// The about page, in English (/about) and Catalan (/ca/about). Its text is
// content: content/pages/about.md and content/ca/pages/about.md, with images
// in public/about/. See specs/0007-about-page.

export function renderAbout(locale: Locale) {
  const file = locale === 'ca' ? './content/ca/pages/about.md' : './content/pages/about.md';
  return renderMarkdown(readFileSync(file, 'utf8'));
}

export async function aboutMetadata(locale: Locale): Promise<Metadata> {
  const t = await getTranslations(locale);
  const title = `${t.ABOUT_TITLE} | HTTP Cats`;
  const url = absoluteUrl(aboutPath(locale));

  return {
    title,
    description: t.ABOUT_DESCRIPTION,
    alternates: alternatesFor(aboutPath(locale)),
    openGraph: {
      title,
      description: t.ABOUT_DESCRIPTION,
      url,
      images: [{ url: 'https://http.cat/100.jpg', alt: 'HTTP Cats' }],
    },
    twitter: {
      card: 'summary_large_image',
      site: url,
      title,
      description: t.ABOUT_DESCRIPTION,
      images: ['https://http.cat/100'],
    },
  };
}
