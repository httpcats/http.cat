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

export const metadata: Metadata = { alternates: alternatesFor('/ca') };

export default async function Home() {
  const t = await getTranslations('ca');

  return (
    <>
      <ScrollRestore />
      <Header t={t} />
      <main>
        <Usage t={t} />
        <ThumbnailGrid>
          {Object.values(statuses).map((status) => (
            <Thumbnail
              code={status.code}
              key={status.code}
              description={status.message}
              t={t}
            />
          ))}
        </ThumbnailGrid>
      </main>
      <Footer t={t} />
    </>
  );
}
