# 0008: CORS headers on the images

- **Status:** implemented
- **Issue:** [#214](https://github.com/httpcats/http.cat/issues/214)
- **Affects:** nginx, deploy
- **Depends on:** spec 0001 (implemented)

## Problem

Other sites can show a cat with a plain `<img src="https://http.cat/404">`,
but they can't do anything else with it. The image responses have no
`Access-Control-Allow-Origin` header, so the browser blocks:

- drawing the image on a `<canvas>` and reading it back (`toDataURL`,
  `getImageData`), e.g. to make a meme or a favicon from it.
- `fetch()`ing it, e.g. to check that it loaded, cache it in a service worker
  or store it in IndexedDB.
- loading it with `<img crossorigin>`, which pages need when they send
  `Cross-Origin-Embedder-Policy: require-corp`.

This is for browser extensions, bots with web front-ends, dashboards and
playgrounds that use the cats as images. The JSON already allows this
(spec 0003). The images are public, served without cookies or
authentication, so there's nothing to protect by withholding the header.

## Behavior

The image URLs, the ones the image location in the Nginx config matches
(spec 0001), get `Access-Control-Allow-Origin: *`, whatever their status.
The random image redirect also gets it (spec 0009).

`<code>` is any status code in `lib/statuses.js`.

| Request | Response |
|---|---|
| `GET /<code>`, `GET /<code>.jpg`, `GET /0` | `200`, `image/jpeg`, the cat, **with the header** |
| `GET /<digits>`, `GET /<digits>.jpg` for a code without an image (e.g. `/999`, `/520`) | `404`, `image/jpeg`, the 404 cat, **with the header**. A cross-origin `fetch()` sees the `404`, and `<img crossorigin>` shows the 404 cat, instead of failing |
| `GET /<code>.json`, `GET /999.json` | Unchanged: already have the header (spec 0003) |
| `GET /nope` and other non-numeric not-found URLs | Unchanged: `404`, the 404 cat, **without the header** |
| `GET /images/<code>.jpg` (the URL the site's own thumbnails use) | Unchanged: `200`, **without the header** |
| `GET /dog`, `GET /dog.jpg` | Unchanged: `302` to `/400`, `/400.jpg`, **without the header** |
| `GET /random` | `302` to a status image, **with the header** (spec 0009) |
| `GET /<code>/` | Unchanged: `301` to `/<code>`, **without the header** |
| Pages, other static files, `http://` URLs | Unchanged, **without the header** |

So a site that uses the image API as documented (`https://http.cat/<code>`,
with or without `.jpg`) can always read the response, including for codes
http.cat doesn't have yet. The URLs without the header are the site's own
(`/images/…`), an easter egg (`/dog`), or URLs no client builds on purpose.
A plain `<img>` without `crossorigin` keeps working for all of them, as it
does today.

The value is always `*`. The `Origin` request header is ignored and there's
no `Vary: Origin`, so Cloudflare caches a single copy for everyone.

### The 404 for unknown codes

Nginx applies `add_header` in the location that finally serves the response.
`/404` is served by `try_files` in the image location, so it gets the header.
`/999` only starts there: `try_files` ends with `=404`, and the server-level
`error_page 404 /images/404.jpg` is an internal redirect, which `location /`
serves. A header in the image location would be lost on the way.

So the image location gets its own `error_page 404 /404.jpg`, the same
approach as the JSON location (spec 0003). The internal redirect to
`/404.jpg` matches the image location again, `try_files` serves
`images/404.jpg`, and the response keeps both the header and the `404`
status (`error_page` without `=code` keeps the original status). The body
is the same file as today.

If `images/404.jpg` were missing, the second `try_files` would also end in
`=404` and Nginx would send its own default 404 page (`recursive_error_pages`
is off). The build test already checks that every status, 404 included, has
its image.

### Implementation

In `deploy/nginx/http.cat.conf`, the image location becomes:

```nginx
# the image API: /404 and /404.jpg serve images/404.jpg, whatever the build
# output contains. See specs/0001-image-routing.
#
# Other sites can read the images (canvas, fetch, <img crossorigin>), see
# specs/0008-image-cors. Unknown codes (/999) get the 404 cat from this
# location rather than the server-level error_page, which `location /`
# serves without the header.
location ~ ^/(\d+)(\.jpg)?$ {
    add_header Access-Control-Allow-Origin * always;
    error_page 404 /404.jpg;
    try_files /images/$1.jpg =404;
}
```

- `always` puts the header on the `404` too (without it, Nginx only adds
  headers to `2xx` and `3xx` responses).
- Tried on 2026-11-23 in the local container (`nginx:1.28.3-alpine`, the
  server's version): every `/<code>` and `/<code>.jpg`, `/0` and `/404?v=1`
  return `200` with exactly one `Access-Control-Allow-Origin: *`. `/999` and
  `/999.jpg` return `404`, `image/jpeg`, the 404 cat's bytes, with the
  header. `/nope`, `/images/404.jpg`, `/dog`, `/404/` and `/status/404` don't
  have it. Status, type and `Cache-Control` are the same as before the
  change for every URL, the JSON keeps its header, and the existing smoke
  test passes.
- There's no server-level `add_header`, so adding one here doesn't stop
  another header from being inherited. The expires map isn't an
  `add_header`, so the caching headers are unaffected.
- The server-level `error_page 404 /images/404.jpg` stays: every other
  location still uses it. Its comment ("Kept at server level so the regex
  locations below inherit it too") is no longer true for the image and JSON
  locations, which set their own, so it's reworded to say so.

### Caching

- **Cloudflare:** passes the header through and caches it with the response.
  Its cached images don't have it, so the cache has to be purged after the
  Nginx reload. `scripts/deploy.sh` purges, but this change doesn't go
  through it, so the purge is manual.
- **Browsers:** images are cached for 10 years (`max-age=315360000`).
  A browser that already has an image cached from before the change may
  reuse that copy, without the header, for a `crossorigin` request, and the
  CORS check fails. This only affects a site that showed that image with a
  plain `<img>` before and now uses it with `crossorigin` or `fetch()`: most
  browsers keep a separate cache per top-level site. Nothing on the server
  can fix those copies. Such a site can add a query string (e.g.
  `/404?v=1`), which still matches the image location but isn't in the
  cache.

## Rejected alternative: the header on every response

One `add_header Access-Control-Allow-Origin * always;` at server level would
cover every URL, including `/nope`, `/images/<code>.jpg`, `/dog` and the
`301`s, with no `error_page` change. It's harmless today: everything on the
site is public and there are no cookies, so other sites could only read what
anyone can already download. It was rejected because the header should only
be where there's an API to use:

- Any page or endpoint added later would get the header without anyone
  deciding it should, including something that's not meant to be read by
  other sites.
- Other sites could read the pages from their visitors' browsers, e.g. to
  show the descriptions without the ad, and use the self-hosted font.
- Security scanners and audits report `Access-Control-Allow-Origin: *` on
  every page as a finding.

What it would add over this spec (`/nope`, `/dog`, the `301`s,
`/images/<code>.jpg`) is either an easter egg, the site's internal URLs, or
URLs no client builds on purpose.

## Consequences in the repo

- `specs/0000-baseline/spec.md`: the "Images" table says the image URLs
  have `Access-Control-Allow-Origin: *`, and the "Not found" row says the
  numeric ones (e.g. `/999`) have it too (spec 0008).
- `deploy/nginx/http.cat.conf`: the image location above, and the reworded
  comment on the server-level `error_page`.
- `specs/0001-image-routing/spec.md`: a dated note that the image location
  now has its own `error_page` (spec 0008), next to the point that a
  location without one inherits the server's.
- `README.md`: the "Usage" section says the images, not only the JSON, can be
  used from other sites (`<canvas>`, `fetch()`, `crossorigin`), with the
  query-string tip for old cached copies.
- `specs/README.md`: this spec's row (already added).

## Out of scope

- **The header on other URLs** (see "Rejected alternative").
- **Preflighted requests** (`OPTIONS`). Image `GET`s without custom headers
  don't need one, and `OPTIONS` keeps whatever response it gets today.
- **Credentials** (`Access-Control-Allow-Credentials`). There are no cookies
  to send.
- **`Cross-Origin-Resource-Policy: cross-origin`**. With the CORS header,
  pages that send `Cross-Origin-Embedder-Policy: require-corp` can load the
  images with `<img crossorigin>`. CORP would only add the cases where they
  can't set that attribute: a cat as a CSS `background-image`, or in
  Markdown or user content the page doesn't render itself. Such pages are
  rare (`require-corp` is mostly for `SharedArrayBuffer`, in games,
  emulators and WebAssembly tools), many can use `COEP: credentialless`
  instead, and nobody has asked for it. It can be added later in the same
  location; unlike the CORS header, it doesn't need old browser caches
  cleared.
- **Changing the image URLs** to get around old browser caches.

## Implementation order

There's only the Nginx side:

1. Try the config in the local container (`npm run nginx:up`, then
   `npm run test:smoke`) with the new smoke checks.
2. Copy it to the server, `sudo nginx -t && sudo systemctl reload nginx`.
3. Purge the Cloudflare cache, then run the smoke test against production.

## Acceptance checks

- [x] Nginx config test in `tests/build.test.mjs`: the image location has
      `add_header Access-Control-Allow-Origin * always;` and
      `error_page 404 /404.jpg;`, and there's no server-level `add_header`
      (checked by indentation, like the existing server-level `error_page`
      test). (2026-11-23)
- [x] Smoke checks in `tests/smoke/urls.test.mjs`, against the local
      container and then production (2026-11-23: all 24 smoke checks pass
      against the local container; 2026-11-24: all 24 pass against
      production after the deploy and a Cloudflare purge):
  - `Access-Control-Allow-Origin: *` on every `/<code>` and `/<code>.jpg`
    and on `/0` (200), and on `/999` and `/999.jpg` (404, `image/jpeg`, the
    404 cat's body).
  - No `Access-Control-Allow-Origin` on `/nope`, `/images/404.jpg`, `/dog`,
    `/404/` and `/status/404`, so the header doesn't spread unnoticed. The
    `check` helper only asserts that the header is there (`cors: true`), so
    it also needs `cors: false` to assert that it isn't.
  - The JSON checks (spec 0003) still pass.
- [x] Manual, in a browser, from a page on another origin: an
      `<img crossorigin="anonymous" src="https://http.cat/404">` drawn on a
      `<canvas>` can be read back with `toDataURL()`, an
      `<img crossorigin="anonymous" src="https://http.cat/999">` shows the
      404 cat, and `fetch('https://http.cat/999')` resolves with `status`
      `404`. (2026-11-24, against production)
- [x] Baseline, spec 0001 note, README and `specs/README.md` updated.
      (2026-11-23)

## Open questions

None. Resolved 2026-11-23:

- **Which URLs get the header:** only the image URLs, including the 404 for
  unknown codes. Rejected: every response (see "Rejected alternative").
- **`Cross-Origin-Resource-Policy`:** not added (see "Out of scope").
- **Nginx behavior:** tried in the local container (see "Implementation").
