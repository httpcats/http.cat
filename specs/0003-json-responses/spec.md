# 0003: JSON responses

- **Status:** approved
- **Issue:** —
- **Affects:** site (Next.js build), nginx, deploy
- **Depends on:** spec 0001 (implemented)

## Problem

The site only offers the status information as an HTML page (`/status/<code>`)
or an image (`/<code>`). Anyone who wants the name and description of a status
in their own tool (a CLI, a chat bot, an error page that shows more than the
picture) has to scrape the HTML. A JSON version of each status page would give
them the same information in a form they can use directly.

## Behavior

`<code>` is any status code in `lib/statuses.js`.

| Request | Response |
|---|---|
| `GET /<code>.json` | `200`, `application/json`, the payload below |
| `GET /<code>.json/` | `301` to `/<code>.json` (the trailing-slash rewrite in `location /`) |
| `GET /<digits>.json` for a code not in `statuses.js` (e.g. `/999.json`, `/0.json`) | `404`, `application/json`, the body of `/404.json`. Every 404 on the site is the 404 cat, and this is the 404 cat's JSON. Clients should check the HTTP status, not the `status` field |
| The `200` and `404` `.json` responses above | Also have `Access-Control-Allow-Origin: *`, so browsers can `fetch()` them from other sites. The `301` for a trailing slash comes from `location /` and doesn't have it |
| `GET /<code>`, `GET /<code>.jpg` | Unchanged: the image |
| `GET /ca/<code>.json`, `GET /dog.json` | Unchanged: `404`, the 404 cat image (see "Out of scope") |

Note the difference between `/404.json` (`200`: the information about status
404) and `/999.json` (`404`: no such status, with the same body).

### Payload

`GET /500.json`:

```json
{
  "status": 500,
  "name": "Internal Server Error",
  "description": "The HTTP `500 Internal Server Error` server error response code indicates ...\n\n### See Also\n\n- [Spec](https://www.rfc-editor.org/rfc/rfc9110#status.500)\n- [500 Internal Server Error](https://http.cat/status/500)\n\n**Source:** [https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500)",
  "image": "https://http.cat/500",
  "url": "https://http.cat/status/500"
}
```

| Field | Type | Value |
|---|---|---|
| `status` | number | the code, from `lib/statuses.js` |
| `name` | string | the reason phrase, from `lib/statuses.js` (`message` there) |
| `description` | string | Markdown: `content/<code>.md`, the same text the status page renders, with its first line (the `## Description` heading every content file starts with) removed and leading and trailing whitespace trimmed |
| `image` | string | the image URL, `https://http.cat/<code>` |
| `url` | string | the status page, `https://http.cat/status/<code>` |

`description` is the whole Markdown file rather than plain text because the
descriptions aren't uniform: 40 of the 78 have lists or HTML in the
description itself, some have subheadings, and plain text would lose them along with the "See
Also" links. It also keeps the `**Source:**` line, which is the attribution
for the MDN-derived text (61 of the 78 files have one).

The JSON is pretty-printed with 2-space indentation, so it reads well in
`curl`. The largest response (`/103.json`) is about 1.9 KB.

### Implementation

- **Build:** a static Next.js route handler, `app/[file]/route.ts`, generates
  the files as part of `next build`. Next can't name a dynamic segment
  `[code].json`, so the parameter carries the extension:
  `generateStaticParams` returns `{ file: '<code>.json' }` for every status
  in `lib/statuses.js`, with `dynamic = 'force-static'` and
  `dynamicParams = false`. `GET` reads `content/<code>.md` and returns the
  payload. Tried on 2026-10-19 with Next 16: the build writes exactly one
  `out/<code>.json` per status and nothing else, and the existing tests still
  pass. Static segments (`/status`, `/ca`) and files in `public/` (e.g.
  `/manifest.json`) take precedence over the dynamic one.
- **Nginx** (`deploy/nginx/http.cat.conf`), a new location next to the image
  one:

  ```nginx
  # the JSON API: /500.json returns the status information. See
  # specs/0003-json-responses.
  location ~ ^/\d+\.json$ {
      add_header Access-Control-Allow-Origin * always;
      error_page 404 /404.json;
      try_files $uri =404;
  }
  ```

  - `always` puts the CORS header on the 404 response too.
  - `error_page 404 /404.json` replaces the server-level image `error_page`
    in this location only. Nginx keeps the 404 status and serves the body of
    `/404.json`, which matches this location again.
  - If `out/404.json` is missing, Nginx falls back to its own default 404 page
    (`recursive_error_pages` is off). That can only happen before the build
    side is deployed (see "Implementation order").
  - The regex can't match the same URL as `^/(\d+)(\.jpg)?$` or `^/dog`, so
    the order of the locations doesn't matter. A trailing slash doesn't match
    it, so `/500.json/` gets the existing `301` from `location /`.
  - There's no server-level `add_header`, so adding one here doesn't stop
    another header from being inherited.

### Caching

Nothing changes. The expires map has no `application/json` row, so Nginx sends
no `Cache-Control` for JSON. Cloudflare caches `.json` at the edge anyway
(checked on `/manifest.json` on 2026-10-18: `MISS`, then `HIT`) and sends
browsers `Cache-Control: max-age=14400`, the same as HTML. Each deploy purges
it.

## Consequences in the repo

- `specs/0000-baseline/spec.md` gets a "JSON" table with the rows above, and
  its "Not found" row (`404`, `image/jpeg`) gets an exception for
  `/<digits>.json`.
- The "Out of scope" note in `specs/0001-image-routing/spec.md` says a future
  `/404.json` would be served by `location /`. That's no longer true and is
  updated to point here.
- The README documents the JSON URLs next to the image usage.

## Out of scope

- **Catalan** (`/ca/<code>.json`). The translations exist in `content/ca/`, so
  this can be added later without changing the English URLs.
- **An index** listing every status (e.g. `/statuses.json`).
- **HTML in the payload** (decided: Markdown only). It can be added later as
  a new field (e.g. `description_html`) without breaking clients.
- **`/dog.json` and `/0.json` content.** `/0` has no description, and
  `/dog` is a redirect to an image.
- **`next dev` 404s.** The route works in the dev server too (`/500.json`
  returns the JSON). Unknown top-level URLs (e.g. `/nope`) return `500` in
  dev instead of a 404 page, because static export rejects parameters not in
  `generateStaticParams`. `/status/999` already does the same in dev today.
  Production isn't affected: there, Nginx serves files and never runs Next.
- **Content negotiation** (JSON from `/500` based on the `Accept` header).
  Cloudflare's cache doesn't vary on `Accept`, so it would serve images to
  JSON clients or the other way around.

## Implementation order

The two sides deploy separately, and either order is safe. Build first is
better:

1. Repo: generate the JSON files, add the tests, and run `npm run deploy`.
   Until the Nginx change is live, `/500.json` works but has no CORS header,
   and `/999.json` returns the 404 cat image as today.
2. Nginx: deploy the new location, reload and purge.

In the other order, `/500.json` would already work, but `/999.json` would get
Nginx's default 404 page until `out/404.json` exists.

## Acceptance checks

- [x] Build test in `tests/build.test.mjs`: every status has `out/<code>.json`
      that parses and matches `lib/statuses.js` and `content/<code>.md`
      (all five fields), and every top-level `out/<digits>.json` belongs to a
      status. (2026-10-24)
- [x] Nginx config test in `tests/build.test.mjs`: the JSON location, its
      CORS header and its `error_page` are in `deploy/nginx/http.cat.conf`.
      (2026-10-24)
- [ ] After both deploys (manual, with `curl -sI` and `curl -s`):
      `/500.json` (200 `application/json`, `Access-Control-Allow-Origin: *`,
      body matches the payload), `/404.json` (200), `/999.json` (404
      `application/json`, CORS header, the 404 body), `/0.json` (404 JSON),
      `/500.json/` (301 → `/500.json`), `/500` (200 jpeg), `/999` (404 jpeg).
      `SMOKE_URL=https://http.cat npm run test:smoke` covers all of these;
      run it against the local container first (`npm run nginx:up`).
- [x] Baseline, spec 0001 note and README updated. (2026-10-24)

## Open questions

None. Resolved 2026-10-18:

- **`description` format:** Markdown only. HTML can be added later as a new
  field if needed.
- **What a `.json` URL for an unknown code (e.g. `/999.json`) returns:** status
  `404` with the body of `/404.json`. The status stays `404` because
  `error_page` without `=code` keeps the original status, as it already does
  for `/999` and the 404 cat image. `/404.json` itself is like every other
  status (`200`). Rejected: the 404 cat image (a JSON client would get a
  JPEG) and a separate minimal error body (one more file, no real gain).
