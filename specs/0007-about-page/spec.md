# 0007: About page

- **Status:** implemented
- **Issue:** —
- **Affects:** site (Next.js), content

## Problem

The site doesn't say where it comes from. The only credit is a footer line
("Original Images by Tomomi Imura"), and the history (the Flickr set, the
Heroku app, the move to `http.cat`) is only in the README and in the old
repo, where most visitors never look.

An about page tells that story on the site, in English and Catalan, and
gives Tomomi's original work a proper link.

## Behavior

### Pages

| Request | Response |
|---|---|
| `GET /about` | `200`, `text/html`, the about page |
| `GET /ca/about` | `200`, `text/html`, the about page in Catalan |
| `GET /about/` | `301` to `/about` (the existing trailing-slash rewrite) |
| `GET /ca/about/` | `301` to `/ca/about` (same) |

Everything else is unchanged.

Like the home and status pages, the two are translations of each other
(spec 0005): `/about` is `<html lang="en">` and `/ca/about` is
`<html lang="ca">`, each has a canonical link to its own URL, and both have
`hreflang` alternates for `en`, `ca` and `x-default` (the English one).

### The page

- The same header and footer as the rest of the site, and a "back to home"
  link (`BackLink`) to that language's home page (`/` or `/ca`).
- A heading (`About` / `Sobre`), then the content rendered from Markdown
  with the same pipeline as the blog posts and status descriptions
  (`lib/markdown.ts`: external links open in a new tab).
- `<title>`: `About | HTTP Cats` / `Sobre | HTTP Gats`
- `description`, Open Graph and Twitter metadata: a one-sentence summary in
  the page's language (e.g. "The story of HTTP Cats, from a Flickr set in
  2011 to http.cat."), and the site's default image
  (`https://http.cat/100.jpg`), like the blog.

The UI strings go in the locale files, so both languages have them (the
same-keys check): `ABOUT_TITLE` (the heading and the start of the
`<title>`) and `ABOUT_DESCRIPTION`.

### Content

The exact text isn't part of this spec: once the page exists, editing it is a
content change, like editing a blog post or a status description, and
doesn't need a spec. Both languages must cover, in this order:

1. **Origins (2011).** HTTP Cats was born in 2011 from the Flickr set Tomomi
   Imura created, "HTTP Status Cats - The original", linked:
   <https://www.flickr.com/photos/girliemac/sets/72157628409467125>.
2. **The first version.** It started as a quick project: a Node.js app
   serving the images as static files, hosted on Heroku at
   `httpcats.herokuapp.com` (first commit 14 December 2011, in
   [httpcats/http-status-cats-api](https://github.com/httpcats/http-status-cats-api)).
   The Heroku URL no longer works (it's a `404` today), so it's named as
   text, not linked; the old repo can be linked instead.
3. **http.cat (2015).** The `http.cat` domain was registered on
   24 August 2015 (whois creation date) and the site moved to it; this
   repo's first commit is from the next day.

The page also has **at least one screenshot of how HTTP Cats looked in
the beginning** (the Heroku version), e.g. next to "The first version".
The screenshot comes from the maintainer (or an archived copy of
`httpcats.herokuapp.com`, e.g. on the Wayback Machine) and is an image file
in `public/about/` (see "Images"), not a recreation.

The screenshots are Wayback Machine captures of the home page, one per
milestone: `heroku-2011.webp` (15 December 2011, the Heroku version),
`http-cat-2015.webp` (8 September 2015, the first capture of http.cat),
`http-cat-2017.webp` (8 November 2017, the logo), `http-cat-2019.webp`
(15 June 2019, the React redesign, after the Grumpy Cat banner was gone) and
`http-cat-2021.webp` (3 August 2021, the dark theme, taken with the browser
set to dark). They're taken with headless Chromium at 2x and cropped to the
top of the page. The 2011 one is lossless WebP (the text stays sharp); the
others are mostly photos, so lossy WebP (lossless was several times larger).
The 2019 and 2021 sites built their usage line from the page's URL, so in
the archive it showed the archive's address: in those two screenshots it was
changed back to `https://http.cat/[status_code]`, what visitors saw.

Anything else (credits, how it's built today, the API, the blog) is up to
whoever writes the content. The Catalan text is a translation of the
English one: same sections, same links, same images (with the alt text
translated).

The content lives in `content/pages/about.md` and
`content/ca/pages/about.md`. It can't be `content/about.md` or
`content/ca/about.md`: the build test only allows status codes directly in
those directories (the orphan check), and a subdirectory isn't covered by
it, like `content/blog/`.

### Images

Images used by the page go in `public/about/` and are referenced from the
Markdown as `/about/<file>` (e.g. `![HTTP Cats in 2011](/about/2011.png)`),
like blog images in `public/blog/<slug>/`. They can't go in
`public/images/`, which the build test only allows status images in. Every
image has alt text describing it, and is shown no wider than the text,
with a 3px grey border: a screenshot can have the page's color at its edges
(white on white, or dark on dark), and the border shows where it starts and
ends. The paragraph right after an image is its caption: italic, close to
the image, with more room around the image and caption than between
paragraphs.

| Request | Response |
|---|---|
| `GET /about/<file>` for a file in `public/about/` | `200`, the file. Not in the smoke test, since it depends on which images exist |

`/about` (the page, `out/about.html`) and `out/about/` (the image folder)
can both exist, as `/blog` and `out/blog/` already do: Nginx's
`try_files $uri $uri.html ...` doesn't match a directory with `$uri`, so
`/about` still gets the page.

### Getting to the page

An "About" link in the footer, right before the Blog link, on every page:

> Versió Catalana · About · Blog · Settings

It goes to the about page in the page's language: `/about` on the English
pages (blog included), `/ca/about` on the Catalan ones. Since the link's
target is in the same language as the page, it has no `hreflang`. It needs
a new `ABOUT_LINK_TEXT` key in both `locales/en/common.json` (`About`) and
`locales/ca/common.json` (`Sobre`).

### Command line

An `about` command in the `:` command line (spec 0006), listed right after
`status` and before `blog`, in the footer's order. Like `blog`, it takes no
argument (`about x` is E488), so its row runs it. It goes to the about page
in the page's language (`/about` or `/ca/about`), like the footer link, and
is marked current on the about page. Description: `COMMAND_ABOUT`,
`Go to the about page` / `Ves a la pàgina Sobre`. `a` and `ab` list it;
`abouts` is E492.

### Sitemap

`/about` and `/ca/about` are added to the sitemap (spec 0005), with their
language alternates, like the home and status pages.

### Implementation

- `app/(en)/about/page.tsx` and `app/(ca)/ca/about/page.tsx`, which only
  pick the language. The page itself is `components/AboutPage/`, inside
  `PostContent` like a blog post, and `lib/about.ts` reads and renders the
  Markdown and builds the metadata for either language.
- `lib/site.ts`: `isTranslated` also returns true for `/about`, so
  `alternatesFor` gives both pages their alternates (used by the pages'
  metadata and the sitemap), and `pathInLanguage` maps `/about` ↔
  `/ca/about`, so the `:lang` command (spec 0006) switches between them
  instead of going to the home page.
- The footer's language link (`Versió Catalana` / `English Version`) is
  unchanged: it goes to the other language's home page, as it does from a
  status page today.
- **Nginx: no change expected.** `/about` and `/ca/about` are served by
  `location /` through `$uri.html` (`out/about.html`, `out/ca/about.html`),
  like `/blog` and `/ca/status/<code>`. The image and JSON locations only
  match digits, so they can't match either.
- The static `about` segment takes precedence over the dynamic `app/[file]`
  route (as `/blog` does), so the JSON API is unaffected.
- Keyboard navigation (spec 0006): the keys work as on every page. The
  page has no list (`data-keynav-list`), like a blog post, so `hjkl` move
  between its links (the back link, links in the text, the footer).

## Consequences in the repo

- `specs/0000-baseline/spec.md`: the "Pages" table gets the `/about` and
  `/ca/about` rows, and the note on `lang` and `hreflang` alternates
  mentions them with the home and status pages. "Static files" gets the
  `/about/<file>` row.
- `specs/0005-sitemap/spec.md`: the sitemap URL table and the "Pages"
  (`lang`, canonical, alternates) table get both pages.
- `specs/0006-keyboard-navigation/spec.md`: the footer line becomes
  `Versió Catalana · About · Blog · Settings`, the list of pages the keys
  work on gets the about pages, the lists table gets them (no list), the
  `lang` command lists the about page among the translated ones, and the
  command tables and text get `about`.
- `tests/smoke/urls.test.mjs`: the new rows.
- README: a line on where the about page's content and images live, and
  that it has a Catalan translation to keep in sync.

## Out of scope

- The exact wording of the page.
- Changing the footer credits.

## Acceptance checks

- [x] Build test: `content/pages/about.md` and `content/ca/pages/about.md`
      exist, and `out/about.html` and `out/ca/about.html` exist, have their
      titles, and link to the Flickr set. (2026-11-15)
- [x] Build test: both Markdown files reference at least one image under
      `/about/`, every image they reference exists in `public/about/`, and
      every image has alt text. (2026-11-15)
- [x] Build test: both pages have the `<html lang>`, canonical and
      alternates above, and the sitemap lists both with alternates (the
      existing spec 0005 checks, once the about pages are in their list).
      (2026-11-15)
- [x] Build test: both locale files have `ABOUT_LINK_TEXT` (the existing
      same-keys check). The home, status, blog and about pages link to
      `/about` in the footer and the Catalan home, status and about pages to
      `/ca/about`, right before the blog link, without `hreflang`, with the
      text from the locale (`About` / `Sobre`). (2026-11-15; also checked by
      hand in the HTML that the order is Versió Catalana · About · Blog ·
      Settings in both languages)
- [x] Unit or build test: `pathInLanguage('/about', 'ca')` is `/ca/about`
      and `pathInLanguage('/ca/about', 'en')` is `/about`.
      (`tests/site.test.mjs`, 2026-11-15)
- [x] Unit test: `about` is listed after `status` and before `blog`, `a`
      and `ab` list it, it takes no argument (`about x` is E488), `abouts`
      is E492, and its description is translated
      (`tests/commands.test.mjs`, 2026-11-15)
- [x] Manual: `:about` opens `/about` from an English page and `/ca/about`
      from a Catalan one, and is marked current there. (2026-11-15, headless
      Chromium driven over the DevTools protocol against the local
      container, from `/status/404` and `/ca/status/404`)
- [x] Smoke test (local container, then production after deploy): `/about`
      and `/ca/about` (200 html), `/about/` and `/ca/about/` (301 without
      the slash), and `/500`, `/500.json` unchanged. (2026-11-15: all 21
      smoke checks pass against the local container, which also serves
      `/about/heroku-2011.webp` as `image/webp`. Production after deploy.)
- [ ] Manual: both pages read well in light and dark themes and on a phone.
      (2026-11-15: checked with headless Chromium screenshots of the build,
      English light, Catalan dark and English at 390px wide. The screenshot
      is small on a phone but recognisable. Still to check in a real
      browser.)
- [x] Baseline, specs 0005 and 0006, README and smoke test updated.
      (2026-11-15)
