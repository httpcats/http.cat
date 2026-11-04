import { readFileSync } from 'fs';

import { renderMarkdown } from './markdown';

export async function getStatusInfo(status: string, locale: string = 'en') {
  const filePath =
    locale === 'ca' ? `./content/ca/${status}.md` : `./content/${status}.md`;

  const fileContent = readFileSync(filePath, 'utf8');

  return renderMarkdown(fileContent);
}
