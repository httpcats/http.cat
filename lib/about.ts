import { readFileSync } from 'fs';
import type { Metadata } from 'next';

import { renderMarkdown } from './markdown';
import { aboutPath, alternatesFor, openGraphFor, type Locale } from './site';
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

  return {
    title,
    description: t.ABOUT_DESCRIPTION,
    alternates: alternatesFor(aboutPath(locale)),
    openGraph: openGraphFor({
      pathname: aboutPath(locale),
      locale,
      title,
      description: t.ABOUT_DESCRIPTION,
    }),
  };
}
