// Content and build output checks for the invariants described in
// specs/0000-baseline/spec.md. Run `npm run build` before `npm test`.

import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { expectedStatusJson } from './helpers/status-json.mjs';

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
    // anything else in there is served at /images/<name>, a URL nobody decided on
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

describe('nginx config', () => {
  // The config is deployed by hand, so this only asserts that the file the
  // repo calls the source of truth still carries the rules the site relies on.
  const conf = readFileSync(path.join(root, 'deploy/nginx/http.cat.conf'), 'utf8');

  test('routes image URLs explicitly (spec 0001)', () => {
    assert.ok(conf.includes('location ~ ^/(\\d+)(\\.jpg)?$ {'), 'image location missing');
    assert.ok(conf.includes('try_files /images/$1.jpg =404;'), 'image try_files missing');
  });

  test('every 404 is the 404 cat', () => {
    // 4-space indent = server level, where all locations inherit it
    assert.ok(conf.includes('\n    error_page 404 /images/404.jpg;'), 'server-level error_page missing');
  });

  test('enables HTTP/2 with the http2 directive', () => {
    // the server runs Nginx 1.28, where `listen ... http2` is deprecated
    assert.ok(conf.includes('\n    http2 on;'), 'http2 directive missing');
    assert.ok(!/^\s*listen\b[^;]*\bhttp2\b/m.test(conf), 'listen has the deprecated http2 parameter');
  });

  test('serves the JSON API with CORS and a JSON 404 (spec 0003)', () => {
    const start = conf.indexOf('location ~ ^/\\d+\\.json$ {');
    assert.ok(start !== -1, 'JSON location missing');
    const block = conf.slice(start, conf.indexOf('}', start));
    assert.ok(block.includes('add_header Access-Control-Allow-Origin * always;'), 'CORS header missing');
    assert.ok(block.includes('error_page 404 /404.json;'), 'JSON error_page missing');
    assert.ok(block.includes('try_files $uri =404;'), 'JSON try_files missing');
  });
});

describe('build output', () => {
  const out = path.join(root, 'out');

  before(() => {
    assert.ok(existsSync(out), 'out/ not found, run `npm run build` first');
  });

  test('no page is named like a status code', () => {
    // Nginx routes every all-digit URL to images/, so a top-level out/<digits>
    // page could never be reached. Next's not-found page (404.html) is the one
    // exception: it's only meant to be served as /404.html.
    const allowed = ['404.html'];
    const unreachable = readdirSync(out).filter(
      (entry) => /^\d+(\.html)?$/.test(entry) && !allowed.includes(entry),
    );
    assert.deepEqual(unreachable, []);
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

  test("Next's not-found page shows the 404 cat (spec 0002)", () => {
    for (const file of ['out/404.html', 'out/_not-found.html']) {
      const html = readFileSync(path.join(root, file), 'utf8');
      assert.ok(/<img[^>]+src="\/images\/404\.jpg"/.test(html), `${file} has no 404 cat`);
      assert.ok(html.includes('<title>404 Not Found | HTTP Cats</title>'), `${file} has the wrong title`);
    }
  });

  test('every status has a JSON file matching its content (spec 0003)', () => {
    for (const code of codes) {
      const file = path.join(out, `${code}.json`);
      assert.ok(isFile(file), `out/${code}.json missing`);
      assert.deepEqual(JSON.parse(readFileSync(file, 'utf8')), expectedStatusJson(code));
    }
  });

  test('every JSON file named like a status code belongs to a status', () => {
    // Nginx answers /<digits>.json for unknown codes with the 404 JSON, so any
    // other out/<digits>.json would be a status nobody decided on
    const orphans = readdirSync(out).filter(
      (entry) => /^\d+\.json$/.test(entry) && !codes.includes(entry.slice(0, -'.json'.length)),
    );
    assert.deepEqual(orphans, []);
  });

  test('every image is in the build output', () => {
    const expected = listNames('public/images', '.jpg').map((name) => `out/images/${name}.jpg`);
    assert.deepEqual(missing(expected), []);
  });
});
