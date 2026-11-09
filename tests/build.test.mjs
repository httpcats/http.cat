// Content and build output checks for the invariants described in
// specs/0000-baseline/spec.md. Run `npm run build` before `npm test`.

import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { unified } from 'unified';
import remarkParse from 'remark-parse';

import { expectedStatusJson } from './helpers/status-json.mjs';
import { listPosts, postFileName, postsDir } from './helpers/posts.mjs';

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

  test('every translation key used in the code exists', () => {
    // a missing key renders as undefined, e.g. an image with no alt text
    const keys = Object.keys(require('../locales/en/common.json'));
    const used = new Set(
      ['app', 'components'].flatMap((dir) =>
        readdirSync(path.join(root, dir), { recursive: true })
          .filter((file) => /\.tsx?$/.test(file))
          .flatMap((file) => [
            ...readFileSync(path.join(root, dir, file), 'utf8').matchAll(/\bt\.([A-Z][A-Z0-9_]*)\b/g),
          ])
          .map(([, key]) => key),
      ),
    );
    assert.deepEqual([...used].filter((key) => !keys.includes(key)), []);
  });
});

describe('blog posts (spec 0004)', () => {
  const posts = listPosts();

  test('there is at least one post', () => {
    // the list page and the export of /blog/[slug] need one
    assert.ok(posts.length > 0);
  });

  test('every file is named <YYYY-MM-DD>-<slug>.md', () => {
    const invalid = readdirSync(postsDir).filter((file) => !postFileName.test(file));
    assert.deepEqual(invalid, []);
  });

  test('dates are real and slugs are unique and not all digits', () => {
    for (const { file, date, slug } of posts) {
      const parsed = new Date(`${date}T00:00:00Z`);
      assert.ok(!Number.isNaN(parsed.getTime()), `${file}: invalid date`);
      assert.equal(parsed.toISOString().slice(0, 10), date, `${file}: invalid date`);
      assert.ok(!/^\d+$/.test(slug), `${file}: the slug is all digits`);
    }
    const slugs = posts.map((post) => post.slug);
    assert.deepEqual(slugs, [...new Set(slugs)], 'duplicate slugs');
  });

  test('every post starts with a `# ` title followed by a paragraph', () => {
    for (const { file } of posts) {
      const markdown = readFileSync(path.join(postsDir, file), 'utf8');
      const [heading, paragraph] = unified().use(remarkParse).parse(markdown).children;
      assert.ok(markdown.startsWith('# '), `${file}: doesn't start with \`# \``);
      assert.equal(heading?.type, 'heading', `${file}: no title`);
      assert.equal(heading.depth, 1, `${file}: the title isn't a \`# \` heading`);
      assert.equal(paragraph?.type, 'paragraph', `${file}: no paragraph after the title`);
    }
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

  test('every blog post has a page, and the blog links to them newest first (spec 0004)', () => {
    const posts = listPosts();
    assert.deepEqual(missing(posts.map(({ slug }) => `out/blog/${slug}.html`)), []);

    const html = readFileSync(path.join(out, 'blog.html'), 'utf8');
    const linked = [...html.matchAll(/href="\/blog\/([^"]+)"/g)].map(([, slug]) => slug);
    assert.deepEqual(linked, posts.map(({ slug }) => slug));
  });

  test('every page links to the blog in the footer (spec 0004)', () => {
    for (const file of ['out/index.html', 'out/ca.html', 'out/status/404.html', 'out/blog.html']) {
      const html = readFileSync(path.join(root, file), 'utf8');
      assert.ok(html.includes('href="/blog">Blog</a>'), `${file} has no blog link`);
    }
  });

  test('keyboard navigation: the lists are marked (spec 0006)', () => {
    for (const file of ['out/index.html', 'out/ca.html', 'out/blog.html']) {
      const html = readFileSync(path.join(root, file), 'utf8');
      assert.ok(html.includes('data-keynav-list'), `${file} has no data-keynav-list`);
    }
  });

  test('every page has the Settings link and window, and the theme script (spec 0006)', () => {
    for (const [file, locale] of [
      ['out/index.html', 'en'],
      ['out/status/404.html', 'en'],
      ['out/blog.html', 'en'],
      ['out/404.html', 'en'],
      ['out/ca.html', 'ca'],
      ['out/ca/status/404.html', 'ca'],
    ]) {
      const t = JSON.parse(readFileSync(path.join(root, `locales/${locale}/common.json`), 'utf8'));
      const html = readFileSync(path.join(root, file), 'utf8');

      assert.ok(html.includes(`>${t.SETTINGS_LINK_TEXT}</button>`), `${file} has no Settings link`);
      const dialog = html.match(/<dialog[^>]*aria-labelledby="settings-title"[^>]*>[\s\S]*?<\/dialog>/)?.[0] ?? '';
      assert.ok(dialog.includes(t.SETTINGS_TITLE), `${file} has no settings window`);
      for (const label of [t.SETTINGS_KEYNAV_LABEL, t.SETTINGS_DARK_THEME_LABEL]) {
        assert.ok(
          new RegExp(`role="switch"[^>]*><span>${label.replace(/[()]/g, '\\$&')}</span>`).test(dialog),
          `${file} has no "${label}" switch`,
        );
      }

      const head = html.slice(0, html.indexOf('</head>'));
      assert.ok(head.includes("localStorage.getItem('theme')"), `${file} has no theme script in <head>`);

      // the `:` command line (closed, so its list shows every command)
      assert.ok(
        new RegExp(`role="combobox"[^>]*placeholder="${t.COMMAND_PLACEHOLDER}"`).test(html),
        `${file} has no command line`,
      );
      assert.ok(html.includes(`>${t.COMMAND_THEME}</span>`), `${file} has no command list`);
    }
  });

  test('no stylesheet uses prefers-color-scheme for the theme (spec 0006)', () => {
    // it would ignore the theme chosen in the settings; colors use light-dark()
    const sources = ['app', 'components'].flatMap((dir) =>
      readdirSync(path.join(root, dir), { recursive: true })
        .filter((file) => file.endsWith('.css'))
        .map((file) => path.join(dir, file)),
    );
    const offenders = sources.filter((file) =>
      /@media[^{]*prefers-color-scheme/.test(readFileSync(path.join(root, file), 'utf8')),
    );
    assert.deepEqual(offenders, []);
  });

  test('every image is in the build output', () => {
    const expected = listNames('public/images', '.jpg').map((name) => `out/images/${name}.jpg`);
    assert.deepEqual(missing(expected), []);
  });
});

describe('sitemap and language tags (spec 0005)', () => {
  const site = 'https://http.cat';

  // Every page that should be in the sitemap: its URL path, exported file,
  // <html lang>, English/Catalan pair (translated pages only) and image.
  const pair = (en, ca) => ({ en: `${site}${en}`, ca: `${site}${ca}`, 'x-default': `${site}${en}` });
  const pages = [
    { path: '/', file: 'out/index.html', lang: 'en', languages: pair('/', '/ca') },
    { path: '/ca', file: 'out/ca.html', lang: 'ca', languages: pair('/', '/ca') },
    ...codes.flatMap((code) => {
      const languages = pair(`/status/${code}`, `/ca/status/${code}`);
      const image = `${site}/images/${code}.jpg`;
      return [
        { path: `/status/${code}`, file: `out/status/${code}.html`, lang: 'en', languages, image },
        { path: `/ca/status/${code}`, file: `out/ca/status/${code}.html`, lang: 'ca', languages, image },
      ];
    }),
    { path: '/blog', file: 'out/blog.html', lang: 'en' },
    ...listPosts().map(({ slug }) => ({
      path: `/blog/${slug}`,
      file: `out/blog/${slug}.html`,
      lang: 'en',
    })),
  ];

  // <url> entries of out/sitemap.xml, by <loc>
  const readSitemap = () => {
    const xml = readFileSync(path.join(root, 'out/sitemap.xml'), 'utf8');
    assert.ok(xml.startsWith('<?xml'), 'out/sitemap.xml is not XML');
    assert.ok(xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'), 'no <urlset>');
    const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, body]) => ({
      loc: /<loc>([^<]*)<\/loc>/.exec(body)?.[1],
      languages: Object.fromEntries(
        [...body.matchAll(/<xhtml:link rel="alternate" hreflang="([^"]+)" href="([^"]+)" \/>/g)].map(
          ([, lang, href]) => [lang, href],
        ),
      ),
      images: [...body.matchAll(/<image:loc>([^<]*)<\/image:loc>/g)].map(([, src]) => src),
      lastmod: body.includes('<lastmod>'),
    }));
    return new Map(entries.map((entry) => [entry.loc, entry]));
  };

  test('the sitemap lists exactly the pages', () => {
    const entries = readSitemap();
    assert.deepEqual(
      [...entries.keys()].sort(),
      pages.map((page) => `${site}${page.path}`).sort(),
    );
  });

  test('sitemap entries have their language versions and cat image, and nothing else', () => {
    const entries = readSitemap();
    for (const page of pages) {
      const entry = entries.get(`${site}${page.path}`);
      assert.ok(entry, `${page.path} missing`);
      assert.deepEqual(entry.languages, page.languages ?? {}, `${page.path}: alternates`);
      assert.deepEqual(entry.images, page.image ? [page.image] : [], `${page.path}: images`);
      assert.equal(entry.lastmod, false, `${page.path}: has a lastmod`);
    }
  });

  test('every page has its lang, canonical and language versions in <head>', () => {
    for (const page of pages) {
      const html = readFileSync(path.join(root, page.file), 'utf8');
      const htmlLang = /<html lang="([^"]+)"/.exec(html)?.[1];
      const canonicals = [...html.matchAll(/<link rel="canonical" href="([^"]+)"\/>/g)].map(([, href]) => href);
      const languages = Object.fromEntries(
        [...html.matchAll(/<link rel="alternate" hrefLang="([^"]+)" href="([^"]+)"\/>/g)].map(
          ([, lang, href]) => [lang, href],
        ),
      );
      assert.equal(htmlLang, page.lang, `${page.file}: <html lang>`);
      assert.deepEqual(canonicals, [`${site}${page.path}`], `${page.file}: canonical`);
      assert.deepEqual(languages, page.languages ?? {}, `${page.file}: alternates`);
    }
  });

  test("Next's not-found page is English, with no canonical", () => {
    for (const file of ['out/404.html', 'out/_not-found.html']) {
      const html = readFileSync(path.join(root, file), 'utf8');
      assert.ok(html.includes('<html lang="en"'), `${file}: <html lang>`);
      assert.ok(!html.includes('rel="canonical"'), `${file}: has a canonical`);
    }
  });

  test('robots.txt points to the sitemap', () => {
    const robots = readFileSync(path.join(root, 'public/robots.txt'), 'utf8');
    assert.match(robots, /^Sitemap: https:\/\/http\.cat\/sitemap\.xml$/m);
  });
});
