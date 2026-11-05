import { Metadata } from 'next';
import Link from 'next/link';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { formatDate, getPosts } from '@/lib/posts';
import { getTranslations } from '@/lib/translation';
import { alternatesFor } from '@/lib/site';

// The blog is English only. See specs/0004-blog.
export const metadata: Metadata = {
  title: 'Blog | HTTP Cats',
  description: 'News about HTTP Cats, and the odd note about HTTP.',
  alternates: alternatesFor('/blog'),
};

export default async function Blog() {
  const t = await getTranslations('en');
  const posts = getPosts();

  return (
    <>
      <Header t={t} />
      <main>
        <nav>
          <Link href="/" className="text-white">{`< ${t.BACK_TO_HOME}`}</Link>
        </nav>

        <h1 className="text-center my-12">Latest Posts</h1>

        <section className="flex justify-center tracking-wider">
          <ul className="max-w-3xl w-full list-disc">
            {posts.map((post) => (
              <li key={post.slug} className="mb-2">
                <Link href={`/blog/${post.slug}`} className="text-interactive">
                  {post.title}
                </Link>
                {' · '}
                <time dateTime={post.date} className="text-sm">
                  {formatDate(post.date)}
                </time>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer t={t} />
    </>
  );
}
