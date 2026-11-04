import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeShiki from '@shikijs/rehype';
import rehypeStringify from 'rehype-stringify';

// Renders the site's Markdown content (status descriptions and blog posts):
// external links open in a new tab and inline HTML is kept. With `highlight`,
// fenced code blocks with a language (```js) are syntax highlighted at build
// time, with light and dark colors as CSS variables (see PostContent).
export async function renderMarkdown(source: string, { highlight = false } = {}) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeExternalLinks, { target: '_blank', rel: ['noopener'] });

  if (highlight) {
    processor.use(rehypeShiki, {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
      // load only the languages the content uses, not all of Shiki's
      lazy: true,
      langs: [],
      // an unknown language is shown as plain text instead of failing the build
      fallbackLanguage: 'text',
    });
  }

  const result = await processor
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(source);

  return result.toString();
}
