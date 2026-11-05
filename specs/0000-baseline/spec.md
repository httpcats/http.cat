# 0000: Baseline

- **Status:** implemented
- **Issue:** —
- **Affects:** site (Next.js), nginx, content, deploy

## Problem

The site had no written description of how it behaves. Most of its public
behavior is a contract between the Next.js static export (`out/`) and the Nginx
config (`deploy/nginx/http.cat.conf`), and breaking either side breaks URLs that
other sites depend on (e.g. issue #267). This spec describes the behavior as of
2026-10-25, including specs 0001 to 0003, verified against production.

## Behavior

`<code>` is any status code in `lib/statuses.js`.

### Pages

Every page in this table has a canonical link to its own URL. The English and
Catalan home and status pages are `<html lang="en">` and `<html lang="ca">` respectively,
and link to each other with `hreflang` alternates (`x-default` is the English
one). The blog is `lang="en"`. See spec 0005.

| Request | Response |
|---|---|
| `GET /` | `200`, home page listing every status in `lib/statuses.js` |
| `GET /status/<code>` | `200`, status page with the image and description |
| `GET /ca` | `200`, home page in Catalan |
| `GET /ca/status/<code>` | `200`, status page in Catalan |
| `GET /blog` | `200`, the blog: every post, newest first (English only, see spec 0004) |
| `GET /blog/<slug>` | `200`, a blog post, for every `content/blog/<YYYY-MM-DD>-<slug>.md` |

### Images (the "API")

| Request | Response |
|---|---|
| `GET /<code>` | `200`, `image/jpeg`, the cat for that status |
| `GET /<code>.jpg` | `200`, `image/jpeg`, the cat for that status |
| `GET /<code>/` | `301` to `/<code>` |
| `GET /0` | `200`, `image/jpeg`, hidden grumpy cat memorial (not listed on the site) |
| `GET /dog`, `GET /dog.jpg` | `302` to `/400`, `/400.jpg` respectively (easter egg) |

### JSON

See spec 0003 for the payload.

| Request | Response |
|---|---|
| `GET /<code>.json` | `200`, `application/json`, the status, its name and description, and its image and page URLs |
| `GET /<code>.json/` | `301` to `/<code>.json` |
| `GET /<digits>.json` for a code not in `lib/statuses.js` (e.g. `/999.json`, `/0.json`) | `404`, `application/json`, the body of `/404.json` |

The `200` and `404` JSON responses have `Access-Control-Allow-Origin: *`.
`/ca/<code>.json` and `/dog.json` aren't JSON URLs: they return the 404 cat.

### Static files

| Request | Response |
|---|---|
| Files in `public/` (e.g. `/robots.txt`, `/manifest.json`, `/opensearch.xml`, `/favicon.ico`) | `200`, the file. `/robots.txt` points to the sitemap |
| `GET /sitemap.xml` | `200`, `text/xml`, every page, with language alternates and the status pages' cat images (spec 0005) |
| Any file in the build output by its exact path (e.g. `/ca.html`, `/status/404.html`, `/index`, `/_not-found`, `/404.html`) | `200`, the file. Not linked from anywhere; a side effect of how Nginx serves `out/`. `/404.html` and `/_not-found` are Next's not-found page, which shows the 404 cat (spec 0002) |

### Not found

| Request | Response |
|---|---|
| Any other URL (e.g. `/999`, `/nope`, `/dog.json`, `/blog/nope`) | `404`, `image/jpeg`, the 404 cat. `/<digits>.json` is the exception: it gets the 404 JSON (see JSON) |
| Directories without a page (e.g. `/status`, `/images`) | `404`, `image/jpeg`, the 404 cat |

### Other

- Every URL with a trailing slash, except `/`, gets a `301` to the same URL
  without the slash before anything else is tried. This applies to pages,
  images, directories and unknown URLs alike: `/status/404/` → `/status/404`,
  `/404/` → `/404`, `/blog/` → `/blog`, `/nope/` → `/nope` (which then
  returns the 404 cat).
- Client-side navigation data (e.g. `/status/<code>/__next._tree.txt`) is served
  as `200` files.
- Caching: Nginx marks HTML as already expired and images/CSS/JS as cached for
  the max duration (`Cache-Control: max-age=315360000`). In production,
  Cloudflare rewrites the HTML header to `Cache-Control: max-age=14400`, so
  browsers may keep a page for up to 4 hours after a deploy. JSON gets no
  `Cache-Control` from Nginx; Cloudflare caches it at the edge anyway and
  sends browsers `max-age=14400`, as for HTML.
- `http://` redirects to `https://` with a `301`.
- After each deploy the Cloudflare cache is purged (`scripts/deploy.sh`).

### Invariants these rely on

- Every status in `lib/statuses.js` has `public/images/<code>.jpg`,
  `public/images-original/<code>.jpg`, `content/<code>.md` and
  `content/ca/<code>.md`.
- Image URLs don't depend on the build output: Nginx routes every all-digit
  URL (with or without `.jpg`) straight to `images/<digits>.jpg` in a
  dedicated location, so a page or file named like a status code (e.g. the
  `404.html` Next always generates) can't replace a cat. See spec 0001.
- The only `out/<digits>.json` files are the statuses' own, so every other
  `/<digits>.json` gets the 404 JSON. See spec 0003.
- `locales/en/common.json` and `locales/ca/common.json` have the same keys.
- Every file in `content/blog/` is named `<YYYY-MM-DD>-<slug>.md` (a real
  date, and a slug of lowercase letters, digits and hyphens that isn't all
  digits and is unique), and starts with a `# ` title followed by a
  paragraph. There's at least one post. See spec 0004.

## Out of scope

- Visual design and page content.

## Acceptance checks

- [x] Content and build output invariants: `npm run build && npm test`
      (`tests/build.test.mjs`), run in CI on every PR.
- [x] URL behavior tables above: verified manually against production with
      `curl` on 2026-10-11 and again on 2026-10-18, and with the smoke test on
      2026-10-25. Now automated by
      `tests/smoke/urls.test.mjs`: `npm run test:smoke` against the local
      Nginx container (`npm run nginx:up`), or
      `SMOKE_URL=https://http.cat npm run test:smoke` against production.

## Open questions

None.
