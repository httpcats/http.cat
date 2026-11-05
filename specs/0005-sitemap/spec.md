# 0005: Sitemap and language tags

- **Status:** approved
- **Issue:** —
- **Affects:** site (Next.js), content
- **Depends on:** 0004 (the blog pages are listed in the sitemap)

## Problem

The site has no sitemap: nothing in the build generates one, and
`/sitemap.xml` returns the 404 cat in production (checked 2026-11-04). Search
engines find the status pages by following links from the home page, but
they have no list of every page and no quick way to discover new blog posts.

They also can't tell that the English and Catalan pages are translations of
each other, and the Catalan pages say they're in English:

- No page has `hreflang` alternates or a `canonical` link in its `<head>`.
  The same page is also reachable at side-effect paths of the build output
  (e.g. `/status/404.html`, `/ca.html`, see the baseline) with nothing saying
  which URL is the real one.
- Every page, Catalan included, starts with `<html lang="en">`: it's
  hardcoded in `app/layout.tsx`, the single root layout. Browsers (e.g.
  screen readers, translation prompts) and search engines read
  `/ca/status/404` as English.

This spec adds an XML sitemap for crawlers at `/sitemap.xml`, points to it
from `robots.txt`, declares the language versions of each page both in the
sitemap and in the pages' `<head>`, and gives the Catalan pages
`lang="ca"`. It doesn't add an HTML "site map" page for people.

## Behavior

### URLs

| Request | Response |
|---|---|
| `GET /sitemap.xml` | `200`, XML (content type as served by Nginx for `.xml`, see "Nginx"), the sitemap below |
| `GET /sitemap.xml/` | `301` to `/sitemap.xml` (the existing trailing-slash rewrite) |
| `GET /robots.txt` | `200`, `text/plain`, as today plus a `Sitemap: https://http.cat/sitemap.xml` line |

Every other URL returns what it does today; only the HTML of the pages
changes (see "Pages").

### What the sitemap lists

Every HTML page, as an absolute `https://http.cat` URL without a trailing
slash:

| URL | Count |
|---|---|
| `https://http.cat/` | 1 |
| `https://http.cat/ca` | 1 |
| `https://http.cat/status/<code>` | one per status in `lib/statuses.js` (78 today) |
| `https://http.cat/ca/status/<code>` | one per status in `lib/statuses.js` |
| `https://http.cat/blog` | 1 |
| `https://http.cat/blog/<slug>` | one per post in `content/blog/` |

Not listed:

- the image URLs (`/<code>`, `/<code>.jpg`) and JSON URLs (`/<code>.json`):
  they aren't pages. The cat images are listed as images of their status
  page instead (see "Images")
- `/0`, the hidden memorial cat, and `/dog`
- side-effect paths of the build output (`/ca.html`, `/index`,
  `/_not-found`, `/404.html`, ...) and static files (`/robots.txt`,
  `/manifest.json`, ...)

The list is derived from the same sources the pages are built from
(`lib/statuses.js` and `lib/posts.ts`), so adding a status or a post updates
the sitemap with no extra step.

### Images

Each status page entry, English and Catalan, lists its cat image, so the
cats can show up in image search:

```xml
<image:image><image:loc>https://http.cat/images/404.jpg</image:loc></image:image>
```

The image URL is `/images/<code>.jpg`, the file the page actually embeds,
not the API URL `/<code>`. The home pages and the blog have no image
entries.

### Language versions

The home page and every status page exist in English and Catalan. Each
version declares the full set: itself, the other language, and `x-default`
pointing at the English one (the version for any other language). The same
set is declared in two places, which must agree:

**In the sitemap**, on both entries of the pair:

```xml
<url>
  <loc>https://http.cat/status/404</loc>
  <xhtml:link rel="alternate" hreflang="en" href="https://http.cat/status/404" />
  <xhtml:link rel="alternate" hreflang="ca" href="https://http.cat/ca/status/404" />
  <xhtml:link rel="alternate" hreflang="x-default" href="https://http.cat/status/404" />
  <image:image><image:loc>https://http.cat/images/404.jpg</image:loc></image:image>
</url>
<url>
  <loc>https://http.cat/ca/status/404</loc>
  <xhtml:link rel="alternate" hreflang="en" href="https://http.cat/status/404" />
  <xhtml:link rel="alternate" hreflang="ca" href="https://http.cat/ca/status/404" />
  <xhtml:link rel="alternate" hreflang="x-default" href="https://http.cat/status/404" />
  <image:image><image:loc>https://http.cat/images/404.jpg</image:loc></image:image>
</url>
```

**In each page's `<head>`** (see "Pages").

The blog is English only (spec 0004), so its entries and pages have no
alternates.

### Pages

Every page in the sitemap gets, in its `<head>`, a canonical link to its own
sitemap URL, and the home and status pages also get their language
alternates. For example, `/ca/status/404`:

```html
<html lang="ca">
  <head>
    <link rel="canonical" href="https://http.cat/ca/status/404">
    <link rel="alternate" hreflang="en" href="https://http.cat/status/404">
    <link rel="alternate" hreflang="ca" href="https://http.cat/ca/status/404">
    <link rel="alternate" hreflang="x-default" href="https://http.cat/status/404">
    ...
```

| Page | `<html lang>` | canonical | alternates |
|---|---|---|---|
| `/`, `/status/<code>` | `en` | itself | `en`, `ca`, `x-default` |
| `/ca`, `/ca/status/<code>` | `ca` (today: `en`) | itself | `en`, `ca`, `x-default` |
| `/blog`, `/blog/<slug>` | `en` | itself | none |
| not-found page (`/404.html`, `/_not-found`) | `en` | none | none |

The canonical is the URL without `.html` or a trailing slash, so the
side-effect paths (e.g. `/status/404.html`) point search engines at the real
URL. The tags are in the static HTML (not added by client-side JavaScript),
so crawlers see them without running scripts.

Nothing visible on the pages changes.

### Other fields

No `<lastmod>`, `<changefreq>` or `<priority>` in the sitemap. Nothing in
the repo records when a page last changed (the build date would claim every
page changed on every deploy, and git dates aren't reliable in a shallow CI
checkout), and Google ignores `changefreq` and `priority`.

### Implementation

- **Sitemap:** `app/sitemap.ts`, Next's sitemap metadata route
  (`MetadataRoute.Sitemap`, with `alternates.languages` for the hreflang
  links and `images` for the cats). With `output: 'export'` it's written to
  `out/sitemap.xml` at build time. It's a static metadata route and takes
  precedence over the dynamic `app/[file]` route (which only generates
  `<code>.json` anyway, with `dynamicParams = false`).
- **Head tags:** the pages' existing `metadata` / `generateMetadata` get
  `alternates: { canonical, languages }`. One helper builds the URL set for
  a page (e.g. `alternatesFor('/status/404')`) and is used by both the pages
  and `app/sitemap.ts`, so the two can't disagree.
- **Base URL:** `https://http.cat` is currently hardcoded in
  `app/[file]/route.ts` and `app/layout.tsx`. The sitemap, the head tags and
  the JSON route share one constant instead of adding more copies.
- **`lang="ca"`:** `<html>` is rendered by the root layout, and there's only
  one. The app is split into two route groups, each with its own root
  layout:
  - `app/(en)/layout.tsx` (`lang="en"`): `page.tsx`, `status/`, `blog/`
  - `app/(ca)/layout.tsx` (`lang="ca"`): `ca/page.tsx`, `ca/status/`

  Route groups don't change URLs, so every path stays the same, and
  `scripts/post-build.js` (which copies `out/ca.html`) is unaffected. The
  shared markup (`<head>` links, Carbon ad, wrapper, analytics) moves into
  one component both layouts render. `app/[file]/route.ts` and
  `app/globals.css` stay at the top of `app/`.
  - Consequence: following the footer's language link is now a full page
    load instead of client-side navigation (Next does a full load when the
    root layout changes). This is what makes the browser's `lang` actually
    switch; with one layout it would stay on whatever the first page loaded
    had.
  - With no top-level layout, the root `app/not-found.tsx` has nothing to
    render inside. It becomes `app/global-not-found.tsx`, which renders its
    own `<html lang="en">` and imports `globals.css`, and needs Next's
    experimental `globalNotFound` flag in `next.config.ts`. It must keep
    producing `out/404.html` and `out/_not-found.html` with the 404 cat
    (spec 0002). See open questions.
- **`robots.txt`:** `public/robots.txt` gets the `Sitemap:` line. It stays a
  static file rather than moving to `app/robots.ts`.
- **Nginx: no change expected.** `/sitemap.xml` is served by `location /`
  through `try_files $uri`. The image location (`^/(\d+)(\.jpg)?$`) and JSON
  location (`^/\d+\.json$`) can't match it. Nginx's default `mime.types` maps
  `.xml` to `text/xml` (as for `/opensearch.xml` today); the smoke test
  asserts whatever the local container actually returns, and this spec is
  updated with it. `text/xml` isn't in the `expires` map, so Nginx sends no
  `Cache-Control`; Cloudflare may cache it at the edge, which the purge after
  each deploy already handles.

## Consequences in the repo

- `specs/0000-baseline/spec.md`: the "Static files" table gets a
  `/sitemap.xml` row, the `/robots.txt` mention notes the `Sitemap:` line,
  and the "Pages" table notes the Catalan pages are `lang="ca"`.
- `specs/0002-not-found-page/spec.md`: the implementation note says
  `app/global-not-found.tsx` instead of `app/not-found.tsx`.
- `tests/build.test.mjs` and `tests/smoke/urls.test.mjs`: the new checks.
- After the first deploy, the maintainer may want to submit the sitemap in
  Google Search Console / Bing Webmaster Tools (manual, optional: the
  `robots.txt` line is enough for discovery).

## Out of scope

- An HTML site map page for people.
- A Catalan blog or Catalan not-found page.
- A sitemap index or split sitemaps: ~160 URLs is far below the 50,000-URL
  limit.
- `Link:` HTTP headers for alternates (the sitemap and `<head>` are enough).
- Redirecting the side-effect `.html` paths to their real URLs (an Nginx
  behavior change; the canonical link covers search engines).
- Blog feeds (RSS/Atom), still out of scope as in spec 0004.

## Acceptance checks

- [x] Build test: `out/sitemap.xml` exists and parses; its set of `<loc>`
      URLs is exactly the set derived from `lib/statuses.js`,
      `content/blog/` and the fixed pages (`/`, `/ca`, `/blog`), with no
      `/0`, image, JSON or `.html` URLs; every home and status entry has
      `en`, `ca` and `x-default` alternates pointing at the right pair;
      every status entry has its `/images/<code>.jpg` image and no other
      entry has one. (2026-11-05; also checked that a missing post, an API
      image URL and a Catalan page with `lang="en"` each fail it)
- [x] Build test: for every page in the sitemap, the HTML file has the
      `<html lang>`, canonical and alternates from the "Pages" table, and
      they match the page's sitemap entry. The not-found page is
      `lang="en"`. (2026-11-05)
- [x] Build test: the existing checks still pass, in particular the JSON
      and image outputs and the not-found page (`out/404.html`,
      `out/_not-found.html` with the 404 cat, spec 0002). (2026-11-05)
- [x] Build test: `public/robots.txt` contains
      `Sitemap: https://http.cat/sitemap.xml`. (2026-11-05)
- [ ] Smoke test (local container, then production after deploy):
      `/sitemap.xml` (200, XML content type as observed), `/sitemap.xml/`
      (301 → `/sitemap.xml`), `/robots.txt` body contains the `Sitemap:`
      line, `/ca/status/404` contains `<html lang="ca"`, and `/500`,
      `/500.json`, `/status/500` unchanged. The test expects `text/xml`,
      not yet confirmed against the container.
- [ ] Manual: switching language with the footer link works in both
      directions, and the pages look the same as before. (2026-11-05: the
      exported HTML of the home, status, blog and not-found pages is
      identical to the previous build apart from the new `<head>` tags and
      `lang`; the browser check is still to do)
- [ ] Manual: the production sitemap validates (e.g. Google Search
      Console's sitemap report shows it read with no errors).
- [x] Baseline, spec 0002, CLAUDE.md and smoke test updated. (2026-11-05)

## Open questions

None. Resolved 2026-11-04 / 2026-11-05:

- **`lastmod`, `changefreq`, `priority`:** omitted.
- **Image sitemap:** included, pointing at `/images/<code>.jpg`.
- **Head tags and `lang`:** in this spec rather than a later one.
- **How to get `lang="ca"`:** two root layouts (route groups), with Next's
  experimental `globalNotFound` flag for the not-found page. Rejected:
  rewriting `<html lang>` in the exported Catalan HTML from
  `scripts/post-build.js` (a text substitution on build output, and after
  client-side navigation between languages the browser would keep the first
  page's `lang`).
