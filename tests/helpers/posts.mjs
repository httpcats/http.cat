// The blog posts in content/blog/ (spec 0004), newest first, read from their
// file names. Shared by the build test and the smoke test.

import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export const postsDir = path.join(root, 'content/blog');
export const postFileName = /^(\d{4}-\d{2}-\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/;

// files that don't match postFileName are left out: the build test reports them
export function listPosts() {
  return readdirSync(postsDir)
    .map((file) => ({ file, match: postFileName.exec(file) }))
    .filter(({ match }) => match)
    .map(({ file, match: [, date, slug] }) => ({ file, date, slug }))
    .sort((a, b) =>
      a.date === b.date ? a.slug.localeCompare(b.slug) : b.date.localeCompare(a.date),
    );
}
