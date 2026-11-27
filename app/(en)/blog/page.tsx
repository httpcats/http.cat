import { Metadata } from 'next';
import Link from 'next/link';

import BackLink from '@/components/BackLink';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PostContent from '@/components/PostContent';

import { formatDate, getPosts } from '@/lib/posts';
import { getTranslations } from '@/lib/translation';
import { alternatesFor, openGraphFor } from '@/lib/site';

// The blog is English only. See specs/0004-blog.
const title = 'Blog | HTTP Cats';
const description = 'News about HTTP Cats, and the odd note about HTTP.';

export const metadata: Metadata = {
  title,
  description,
  alternates: alternatesFor('/blog'),
  openGraph: openGraphFor({ pathname: '/blog', locale: 'en', title, description }),
};

export default async function Blog() {
  const t = await getTranslations('en');
  const posts = getPosts();

  return (
    <>
      <Header t={t} />
      <main>
        <BackLink href="/">{t.BACK_TO_HOME}</BackLink>

        <section className="flex justify-center my-12">
          <PostContent>
            <h1>Latest Posts</h1>

            {/* a keyboard navigation list, see specs/0006 */}
            <ul data-keynav-list className="list-disc">
              {posts.map((post) => (
                <li key={post.slug} className="mb-2">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-interactive"
                  >
                    {post.title}
                  </Link>
                  {' · '}
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                </li>
              ))}
            </ul>
          </PostContent>
        </section>
      </main>
      <Footer t={t} />
    </>
  );
}
