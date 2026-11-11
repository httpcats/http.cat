import { Metadata } from 'next';

import Usage from '@/components/Usage';
import ThumbnailGrid from '@/components/ThumbnailGrid';
import Thumbnail from '@/components/Thumbnail';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollRestore from '@/components/ScrollRestore';
import { getTranslations } from '@/lib/translation';

import statuses from '@/lib/statuses';
import { alternatesFor } from '@/lib/site';

export const metadata: Metadata = { alternates: alternatesFor('/') };

export default async function Home() {
  const t = await getTranslations('en');

  return (
    <>
      <ScrollRestore />
      <Header t={t} />
      <main>
        <Usage t={t} />
        <ThumbnailGrid>
          {Object.values(statuses).map((status, index) => (
            <Thumbnail
              code={status.code}
              key={status.code}
              description={status.message}
              index={index}
              t={t}
            />
          ))}
        </ThumbnailGrid>
      </main>
      <Footer t={t} />
    </>
  );
}
