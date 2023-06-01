import Usage from '@/components/Usage';
import ThumbnailGrid from '@/components/ThumbnailGrid';
import Thumbnail from '@/components/Thumbnail';

import statuses from '@/lib/statuses';

export default function Home() {
  return (
    <main>
      <Usage />
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
  );
}
