# 0004: Blog

- **Status:** approved
- **Issue:** —
- **Affects:** site (Next.js), content

## Problem

The site has no place for writing that isn't about a single status code:
announcements (new cats, the JSON API from spec 0003), stories behind the
images, notes on HTTP itself. Today that goes in the README or on social
media, where most visitors to the site never see it.

A blog gives it a home on the site: a page listing the posts, newest first,
and a page per post.

## Behavior

`<slug>` is a post's file name in `content/blog/` without its date prefix
(see "Content").

### Pages

| Request | Response |
|---|---|
| `GET /blog` | `200`, `text/html`, the list of posts, newest first |
| `GET /blog/<slug>` | `200`, `text/html`, the post |
| `GET /blog/` | `301` to `/blog` (the existing trailing-slash rewrite) |
| `GET /blog/<slug>/` | `301` to `/blog/<slug>` (same) |
| `GET /blog/<slug that doesn't exist>` (e.g. `/blog/nope`) | `404`, `image/jpeg`, the 404 cat, like every other unknown URL |
| `GET /blog/<slug>/<file>` for a file in `public/blog/<slug>/` | `200`, the file (images used by the post, see "Images"). Not in the smoke test, since it depends on which posts have images |

Everything else is unchanged.

### The list page (`/blog`)

Under a "Latest Posts" heading, a bulleted list of the posts, newest first,
one line each: the title, linking to `/blog/<slug>`, and the date
(e.g. "Hello, world · 1 November 2026"). The description isn't shown.

No pagination: one page with every post. Revisit when the list gets long.

The page has the same header and footer as the rest of the site, and a
"back to home" link like the status pages.

### The post page (`/blog/<slug>`)

- the date, and the whole Markdown file (title heading included) rendered with
  the same pipeline as the status descriptions (`lib/status-info.ts`:
  external links open in a new tab, inline HTML allowed). No author is shown.
- a link back to `/blog`
- `<title>`: `<post title> | HTTP Cats`
- `description`, Open Graph and Twitter metadata: the post's description, and
  the site's default image (`https://http.cat/100.jpg`)

### Getting to the blog

A "Blog" link in the footer, next to the language link, on every page,
including the Catalan ones. The blog itself is English only, so the link
points to `/blog` in both languages. It needs a new `BLOG_LINK_TEXT` key in
both `locales/en/common.json` and `locales/ca/common.json` (`Blog` in both).

### Content

One plain Markdown file per post, `content/blog/<YYYY-MM-DD>-<slug>.md`, with
no front matter and no separate index. Everything the site needs comes from
the file itself:

`content/blog/2026-11-01-hello-world.md`:

```markdown
# Hello, world

http.cat has a blog.

This is where I'll post news about the site...
```

| What | Where it comes from |
|---|---|
| URL | the file name without the date: `/blog/hello-world` |
| date | the file name's `YYYY-MM-DD` prefix, the publication date. Sorts the list; ties broken by slug |
| title | the first line, which must be a `# ` heading (plain text, no links) |
| description | the first paragraph after the title, as plain text (Markdown formatting removed). Used in the page's metadata (search results and link previews), so it should be a sentence or two |

The build fails if a file doesn't match the name pattern, doesn't start with a
`# ` heading, or has no paragraph after it.

Slugs are lowercase letters, digits and hyphens (`^[a-z0-9]+(-[a-z0-9]+)*$`),
not all digits (so a post URL can never look like a status code), and unique
across dates. The slug is the URL: renaming a file after publishing breaks its
link. Changing the date prefix doesn't.

`content/blog/` is a subdirectory, so the existing check for orphan files in
`content/` (which only looks at `*.md` directly in `content/` and
`content/ca/`) isn't affected.

### Posts are content

Which posts exist isn't part of this spec. Adding, editing or removing a post
is a content change, like adding a cat image, and doesn't need a spec. The
post names in this spec (e.g. `hello-world`) are only examples.

The one rule is that there's always at least one post: the list page would
be empty without one, and the build may fail (see "Implementation"). The
build test checks it.

### Images

Post images go in `public/blog/<slug>/` and are referenced as
`/blog/<slug>/<file>`. They can't go in `public/images/`: the build test
allows only status images there, because everything in it is served at
`/images/<name>`. Cats themselves are referenced by their image file (e.g.
`![](/images/418.jpg)`), not their API URL (`/418`): the API URL only works
through Nginx, so the image would be broken in `npm run dev`.

### Implementation

- `app/blog/page.tsx` (list) and `app/blog/[slug]/page.tsx` (post), with
  `generateStaticParams` over `content/blog/*.md` and `dynamicParams = false`.
- A `lib/posts.ts` that lists `content/blog/`, takes the date and slug from
  each file name, reads the title and description from the Markdown with the
  `remark-parse` parser the site already uses, and fails the build on an
  invalid post. No new dependency.
- The Markdown pipeline in `lib/status-info.ts` is extracted into
  `lib/markdown.ts` so posts and statuses render the same way.
- Dates are shown as e.g. "2 November 2026", formatted in UTC so the build
  machine's timezone can't change them.
- Code blocks in posts with a language (` ```js `) are syntax highlighted at
  build time with Shiki (`@shikijs/rehype`, a new dependency; Next has no
  highlighter of its own). The output is static HTML with no client-side
  JavaScript. Each token gets its light and dark colors (GitHub's themes) as
  CSS variables, and the post styles pick one with `prefers-color-scheme`,
  like the rest of the site. Only the languages used are loaded, and an
  unknown language is shown as plain text. Status descriptions aren't
  highlighted.
- **Nginx: no change expected.** `/blog` and `/blog/<slug>` are served by
  `location /` through `$uri.html` (`out/blog.html`, `out/blog/<slug>.html`),
  exactly like `/status/<code>`. The image location (`^/(\d+)(\.jpg)?$`) and
  the JSON location (`^/\d+\.json$`) are anchored at `/` and can't match
  anything under `/blog/`. Confirmed against the local container on
  2026-11-04 (smoke test).
- The static `app/blog` segment takes precedence over the dynamic
  `app/[file]` route (as `/status` and `/ca` already do), so the JSON API is
  unaffected.
- With `output: 'export'`, a dynamic route whose `generateStaticParams`
  returns nothing may fail the build, which is one more reason there must
  always be at least one post.

## Consequences in the repo

- `specs/0000-baseline/spec.md`: the "Pages" table gets the `/blog` rows, and
  the invariants get the post rules (file name, title heading, first
  paragraph).
- `tests/smoke/urls.test.mjs`: the new rows.
- README: a "Writing a blog post" section (file name, title heading, first
  paragraph, images).

## Out of scope

- **Catalan** (`/ca/blog`, translated posts). Can be added later under
  `/ca/blog` without changing the English URLs.
- **RSS or Atom feed.** Can be added later as a static route handler (e.g.
  `/blog/feed.xml`).
- **Sitemap.** The site has none today (nothing in the build generates one,
  and `/sitemap.xml` is a 404 in production). One would cover the whole site,
  so it gets its own spec.
- **Dated URLs** (`/blog/2026/11/<slug>`): posts are `/blog/<slug>`.
- **Authors:** no author field or author pages.
- **Per-post metadata** beyond what's in the Markdown (e.g. a custom Open
  Graph image): would need front matter, which was decided against.
- Comments, tags or categories, search, pagination.
- Drafts or scheduled posts: an unpublished post lives on a branch.
- A JSON version of posts or of the list.
- Changing the 404 for unknown posts: it's the 404 cat image like everywhere
  else (spec 0002 already covers the HTML not-found page).

## Acceptance checks

- [x] Build test: every `content/blog/*.md` has a valid file name (date and
      slug, slugs unique), starts with a `# ` heading followed by a
      paragraph, and produces `out/blog/<slug>.html`; `out/blog.html` exists
      and links to every post, newest first. (2026-11-02; also checked by
      hand that a post without a title fails the build, and that a second,
      newer post is listed first)
- [x] Build test: the existing JSON and image checks still pass (no
      `out/<digits>.*` introduced by the blog). (2026-11-02)
- [x] Build test: both locale files have `BLOG_LINK_TEXT` (the existing
      same-keys check), and the home, Catalan home, status and blog pages
      link to `/blog`. (2026-11-02)
- [x] Smoke test (local container, then production after deploy):
      `/blog` (200 html), `/blog/<slug>` for every post (200 html), `/blog/`
      (301 → `/blog`), `/blog/<slug>/` (301), `/blog/nope` (404 jpeg), and
      `/500`, `/500.json` unchanged. (2026-11-04: all 16 smoke checks pass
      against the local container. 2026-11-05: all pass against
      production, in the smoke run for spec 0005)
- [ ] Manual: the post's Open Graph card renders (e.g. a link preview in a
      chat app). Needs production.
- [x] Baseline, README and smoke test updated. (2026-11-02)

## Open questions

None. Resolved 2026-11-02:

- **Posts:** not part of the spec; they're content (decided 2026-11-04).
- **Catalan:** English only for now; the Catalan pages link to `/blog`.
- **Feed:** no RSS or Atom for now.
- **Link:** in the footer.
- **Post metadata:** plain Markdown, no front matter and no index file like
  `lib/statuses.js`. The date comes from the file name, the title from the
  first heading, the description from the first paragraph.
- **URLs:** `/blog/<slug>`, not dated.
- **Author:** none.
- **Sitemap:** out of scope (there isn't one today).
