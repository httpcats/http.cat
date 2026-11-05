import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SiteLayout, { siteMetadata, siteViewport } from '@/components/SiteLayout';

import statuses from '@/lib/statuses';
import { getTranslations } from '@/lib/translation';

// Next's not-found page, exported to out/404.html and out/_not-found.html.
// Shows the 404 cat like every other 404 on the site. See specs/0002-not-found-page.
// It's a global-not-found (behind the `globalNotFound` flag) because the site
// has two root layouts, one per language, so it renders its own; see
// specs/0005-sitemap.
const statusObj = statuses[404];

export const metadata: Metadata = {
  ...siteMetadata,
  title: `${statusObj.code} ${statusObj.message} | HTTP Cats`,
};
export const viewport = siteViewport;

export default async function NotFound() {
  const t = await getTranslations('en');

  return (
    <SiteLayout lang="en">
      <Header t={t} />
      <main>
        <nav>
          <Link href="/" className="text-white">{`< ${t.BACK_TO_HOME}`}</Link>
        </nav>

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
