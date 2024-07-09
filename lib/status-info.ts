import { readFileSync } from 'fs';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeStringify from 'rehype-stringify';

export async function getStatusInfo(status: string, locale: string = 'en') {
  const filePath =
    locale === 'ca' ? `./content/ca/${status}.md` : `./content/${status}.md`;

  const fileContent = readFileSync(filePath, 'utf8');

  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeExternalLinks, { target: '_blank', rel: ['noopener'] })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(fileContent);

  return result.toString();
}
