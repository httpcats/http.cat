import type { MetadataRoute } from 'next';

import statuses from '@/lib/statuses';
import { getPosts } from '@/lib/posts';
import { absoluteUrl, alternatesFor } from '@/lib/site';

// The sitemap, exported to out/sitemap.xml: every page, with the language
// versions of the translated ones and the cat image of each status page.
// No lastmod, changefreq or priority. See specs/0005-sitemap.
export const dynamic = 'force-static';

function entry(pathname: string, images?: string[]): MetadataRoute.Sitemap[number] {
  const { canonical, languages } = alternatesFor(pathname);
  return {
    url: canonical,
    ...(languages && { alternates: { languages } }),
    ...(images && { images }),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const codes = Object.keys(statuses);
  const statusEntries = (prefix: string) =>
    codes.map((code) =>
      entry(`${prefix}/status/${code}`, [absoluteUrl(`/images/${code}.jpg`)]),
    );

  return [
    entry('/'),
    entry('/ca'),
    ...statusEntries(''),
    ...statusEntries('/ca'),
    entry('/blog'),
    ...getPosts().map((post) => entry(`/blog/${post.slug}`)),
  ];
}
