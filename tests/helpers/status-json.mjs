// The payload of /<code>.json (spec 0003), built from the repo's content.
// Shared by the build test and the smoke test.

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const statuses = require('../../lib/statuses.js');

export function expectedStatusJson(code) {
  // the content file without its `## Description` heading
  const markdown = readFileSync(path.join(root, `content/${code}.md`), 'utf8');
  return {
    status: statuses[code].code,
    name: statuses[code].message,
    description: markdown.split('\n').slice(1).join('\n').trim(),
    image: `https://http.cat/${code}`,
    url: `https://http.cat/status/${code}`,
  };
}
