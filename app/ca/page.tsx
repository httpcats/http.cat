import Usage from '@/components/Usage';
import ThumbnailGrid from '@/components/ThumbnailGrid';
import Thumbnail from '@/components/Thumbnail';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getTranslations } from '@/lib/translation';

import statuses from '@/lib/statuses';

export default async function Home() {
  const t = await getTranslations('ca');

  return (
    <>
      <Header t={t} />
      <main>
        <Usage t={t} />
        <ThumbnailGrid>
          {Object.values(statuses).map((status) => (
            <Thumbnail
              code={status.code}
              key={status.code}
              description={status.message}
            />
          ))}
        </ThumbnailGrid>
      </main>
      <Footer t={t} />
    </>
  );
}
