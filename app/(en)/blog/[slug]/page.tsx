import { Metadata } from 'next';

import BackLink from '@/components/BackLink';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PostContent from '@/components/PostContent';

import { formatDate, getPost, getPosts, renderPost } from '@/lib/posts';
import { getTranslations } from '@/lib/translation';
import { alternatesFor } from '@/lib/site';

// A blog post, exported to out/blog/<slug>.html. See specs/0004-blog.
export const dynamicParams = false;

export default async function BlogPost(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const post = getPost(params.slug);
  const postHTML = await renderPost(post);

  const t = await getTranslations('en');

  return (
    <>
      <Header t={t} />
      <main>
        <BackLink href="/blog">Back to blog</BackLink>

        <section className="flex justify-center tracking-wider my-12">
          <PostContent>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <div dangerouslySetInnerHTML={{ __html: postHTML }} />
          </PostContent>
        </section>
      </main>
      <Footer t={t} />
    </>
  );
}

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(
  props: {
    params: Promise<{ slug: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const post = getPost(params.slug);
  const title = `${post.title} | HTTP Cats`;

  return {
    title,
    description: post.description,
    alternates: alternatesFor(`/blog/${post.slug}`),
    openGraph: {
      type: 'article',
      title,
      description: post.description,
      url: `https://http.cat/blog/${post.slug}`,
      images: [{ url: 'https://http.cat/100.jpg', alt: 'HTTP Cats' }],
    },
    twitter: {
      card: 'summary_large_image',
      site: `https://http.cat/blog/${post.slug}`,
      title,
      description: post.description,
      images: ['https://http.cat/100'],
    },
  };
}
