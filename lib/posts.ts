import { readdirSync, readFileSync } from 'fs';
import { unified } from 'unified';
import remarkParse from 'remark-parse';

import { renderMarkdown } from './markdown';

// Blog posts: content/blog/<YYYY-MM-DD>-<slug>.md, plain Markdown. The date
// and slug come from the file name, the title from the `# ` heading on the
// first line, and the description from the paragraph after it. Throws on an
// invalid post, which fails the build. See specs/0004-blog.

const POSTS_DIR = './content/blog';
const FILE_NAME = /^(\d{4}-\d{2}-\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/;

export type Post = {
  slug: string;
  date: string;
  title: string;
  description: string;
  markdown: string;
};

type Node = { type: string; depth?: number; value?: string; children?: Node[] };

// the text of a node with its Markdown formatting removed
const toText = (node: Node): string =>
  node.value ?? (node.children ?? []).map(toText).join('');

function parsePost(file: string): Post {
  const match = FILE_NAME.exec(file);
  if (!match) {
    throw new Error(`${POSTS_DIR}/${file}: the file name must be <YYYY-MM-DD>-<slug>.md`);
  }
  const [, date, slug] = match;

  if (/^\d+$/.test(slug)) {
    throw new Error(`${POSTS_DIR}/${file}: the slug can't be all digits`);
  }
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error(`${POSTS_DIR}/${file}: ${date} isn't a valid date`);
  }

  const markdown = readFileSync(`${POSTS_DIR}/${file}`, 'utf8');
  const [heading, paragraph] = (unified().use(remarkParse).parse(markdown) as Node).children ?? [];

  if (!markdown.startsWith('# ') || heading?.type !== 'heading' || heading.depth !== 1) {
    throw new Error(`${POSTS_DIR}/${file}: the first line must be a \`# \` heading`);
  }
  if (paragraph?.type !== 'paragraph') {
    throw new Error(`${POSTS_DIR}/${file}: the title must be followed by a paragraph`);
  }

  return {
    slug,
    date,
    title: toText(heading),
    description: toText(paragraph).replace(/\s+/g, ' ').trim(),
    markdown,
  };
}

// every post, newest first (ties broken by slug)
export function getPosts(): Post[] {
  const posts = readdirSync(POSTS_DIR).map(parsePost);

  const seen = new Set<string>();
  for (const post of posts) {
    if (seen.has(post.slug)) {
      throw new Error(`${POSTS_DIR}: more than one post has the slug ${post.slug}`);
    }
    seen.add(post.slug);
  }

  return posts.sort((a, b) =>
    a.date === b.date ? a.slug.localeCompare(b.slug) : b.date.localeCompare(a.date),
  );
}

export function getPost(slug: string): Post {
  const post = getPosts().find((p) => p.slug === slug);
  if (!post) {
    throw new Error(`no blog post with the slug ${slug}`);
  }
  return post;
}

export const renderPost = (post: Post) => renderMarkdown(post.markdown, { highlight: true });

// e.g. 2 November 2026. In UTC, so the build machine's timezone can't shift it.
export const formatDate = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
