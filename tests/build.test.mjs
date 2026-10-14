// Content and build output checks for the invariants described in
// specs/0000-baseline/spec.md. Run `npm run build` before `npm test`.

import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const statuses = require('../lib/statuses.js');
const codes = Object.keys(statuses);

// Images served at /<name> that aren't in statuses.js (see the baseline spec)
const hiddenImages = ['0'];

const isFile = (p) => statSync(p, { throwIfNoEntry: false })?.isFile() ?? false;
const missing = (paths) => paths.filter((p) => !isFile(path.join(root, p)));
const listNames = (dir, ext) =>
  readdirSync(path.join(root, dir))
    .filter((f) => f.endsWith(ext))
    .map((f) => f.slice(0, -ext.length));

describe('content', () => {
  test('every status has its images and descriptions', () => {
    const expected = codes.flatMap((code) => [
      `public/images/${code}.jpg`,
      `public/images-original/${code}.jpg`,
      `content/${code}.md`,
      `content/ca/${code}.md`,
    ]);
    assert.deepEqual(missing(expected), []);
  });

  test('hidden images exist', () => {
    const expected = hiddenImages.flatMap((name) => [
      `public/images/${name}.jpg`,
      `public/images-original/${name}.jpg`,
    ]);
    assert.deepEqual(missing(expected), []);
  });

  test('every description belongs to a status', () => {
    const orphans = [...listNames('content', '.md'), ...listNames('content/ca', '.md')].filter(
      (name) => !codes.includes(name),
    );
    assert.deepEqual(orphans, []);
  });

  test('every file in public/images is a status or hidden image .jpg', () => {
    // anything else in there becomes a live URL (/<name>) nobody decided on
    const allowed = [...codes, ...hiddenImages].map((name) => `${name}.jpg`);
    const orphans = readdirSync(path.join(root, 'public/images')).filter(
      (file) => !allowed.includes(file),
    );
    assert.deepEqual(orphans, []);
  });

  test('images and images-original have the same files', () => {
    assert.deepEqual(
      readdirSync(path.join(root, 'public/images')).sort(),
      readdirSync(path.join(root, 'public/images-original')).sort(),
    );
  });

  test('English and Catalan translations have the same keys', () => {
    const en = Object.keys(require('../locales/en/common.json')).sort();
    const ca = Object.keys(require('../locales/ca/common.json')).sort();
    assert.deepEqual(ca, en);
  });
});

describe('build output', () => {
  const out = path.join(root, 'out');

  before(() => {
    assert.ok(existsSync(out), 'out/ not found, run `npm run build` first');
  });

  test('every status has an English and a Catalan page', () => {
    const expected = codes.flatMap((code) => [
      `out/status/${code}.html`,
      `out/ca/status/${code}.html`,
    ]);
    assert.deepEqual(missing(expected), []);
  });

  test('home pages link to every status', () => {
    for (const [file, prefix] of [
      ['out/index.html', ''],
      ['out/ca.html', '/ca'],
    ]) {
      const html = readFileSync(path.join(root, file), 'utf8');
      const unlinked = codes.filter(
        (code) => !new RegExp(`href=["']${prefix}/status/${code}["']`).test(html),
      );
      assert.deepEqual(unlinked, [], `${file} is missing links`);
    }
  });

  test('every image is in the build output', () => {
    const expected = listNames('public/images', '.jpg').map((name) => `out/images/${name}.jpg`);
    assert.deepEqual(missing(expected), []);
  });

  test('nothing in the build output would replace an image URL', () => {
    // Nginx tries `$uri`, `$uri.html`, `$uri/index.html` and `/images/$uri`
    // before `/images/$uri.jpg`, so any of out/404, out/404.html,
    // out/404/index.html or out/images/404 would make /404 serve that instead
    // of the 404 cat; same for /404.jpg.
    const shadowing = listNames('public/images', '.jpg').flatMap((name) =>
      [name, `${name}.jpg`]
        .flatMap((url) => [url, `${url}.html`, `${url}/index.html`])
        .concat(`images/${name}`)
        .filter((candidate) => isFile(path.join(out, candidate)))
        .map((candidate) => `out/${candidate}`),
    );
    assert.deepEqual(shadowing, []);
  });
});
