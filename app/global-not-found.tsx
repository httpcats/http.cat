import { Metadata } from 'next';
import Image from 'next/image';

import BackLink from '@/components/BackLink';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SiteLayout, { siteMetadata, siteViewport } from '@/components/SiteLayout';

import statuses from '@/lib/statuses';
import { absoluteUrl, openGraphFor } from '@/lib/site';
import { getTranslations } from '@/lib/translation';
import en from '@/locales/en/common.json';

// Next's not-found page, exported to out/404.html and out/_not-found.html.
// Shows the 404 cat like every other 404 on the site. See specs/0002-not-found-page.
// It's a global-not-found (behind the `globalNotFound` flag) because the site
// has two root layouts, one per language, so it renders its own; see
// specs/0005-sitemap.
const statusObj = statuses[404];

const title = `${statusObj.code} ${statusObj.message} | HTTP Cats`;

// no og:url: the page has no URL of its own (and no canonical, spec 0005)
export const metadata: Metadata = {
  ...siteMetadata,
  title,
  openGraph: openGraphFor({
    locale: 'en',
    title,
    description: en.SITE_DESCRIPTION,
    image: {
      url: absoluteUrl(`/${statusObj.code}.jpg`),
      alt: `${statusObj.code} ${statusObj.message}`,
    },
  }),
};
export const viewport = siteViewport;

export default async function NotFound() {
  const t = await getTranslations('en');

  return (
    <SiteLayout lang="en">
      <Header t={t} />
      <main>
        <BackLink href="/">{t.BACK_TO_HOME}</BackLink>

        <h1 className="text-center my-12">
          {statusObj.code} {statusObj.message}
        </h1>

        <div className="text-center">
          <Image
            src={`/images/${statusObj.code}.jpg`}
            alt={statusObj.message}
            width={750}
            height={600}
            className="w-full h-full max-w-3xl"
          />
        </div>
      </main>
      <Footer t={t} />
    </SiteLayout>
  );
}
