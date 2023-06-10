import { readFileSync } from 'fs';
import { remark } from 'remark';
import html from 'remark-html';

export async function getStatusInfo(status: string) {
  const fileContent = readFileSync(`./content/${status}.md`, 'utf8');
  const result = await remark().use(html).process(fileContent);

  return result.toString();
}
