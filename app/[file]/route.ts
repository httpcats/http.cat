import { readFileSync } from 'fs';

import statuses from '@/lib/statuses';

// The JSON API: exported to out/<code>.json for every status, e.g. /500.json.
// Next can't name a segment `[code].json`, so the parameter carries the
// extension. See specs/0003-json-responses.
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(statuses).map((code) => ({ file: `${code}.json` }));
}

export async function GET(_request: Request, props: { params: Promise<{ file: string }> }) {
  const params = await props.params;
  const code = params.file.replace(/\.json$/, '');
  const statusObj = statuses[code as unknown as keyof typeof statuses];

  // every content file starts with a `## Description` heading
  const markdown = readFileSync(`./content/${code}.md`, 'utf8');
  const description = markdown.split('\n').slice(1).join('\n').trim();

  const payload = {
    status: statusObj.code,
    name: statusObj.message,
    description,
    image: `https://http.cat/${statusObj.code}`,
    url: `https://http.cat/status/${statusObj.code}`,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
}
