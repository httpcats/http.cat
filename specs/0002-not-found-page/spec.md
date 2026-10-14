# 0002: Not-found page shows the 404 cat

- **Status:** approved
- **Issue:** —
- **Affects:** site (Next.js)
- **Depends on:** spec 0001 (implemented and deployed 2026-10-14)

## Problem

http.cat should always answer a 404 with its own 404 cat. Nginx already does
this for error responses (`error_page 404 /images/404.jpg`), but Next.js also
generates a not-found page, served at `/_not-found` and `/404.html`. It's
Next's default page ("404: This page
could not be found."), the one place on the site where a 404 isn't a cat.

There's no option to stop Next from generating it (checked in the Next 16.2.1
export code and the static export docs), so instead the page should show the
cat.

## Behavior

| Request | Response |
|---|---|
| `GET /_not-found`, `GET /_not-found.html`, `GET /404.html` | `200`, a page in the site's layout (header, footer) showing the 404 cat image, titled `404 Not Found \| HTTP Cats` |
| Nginx 404 responses (`/nope`, `/999`) | unchanged: `404`, `image/jpeg`, via `error_page` |

Implementation: an `app/not-found.tsx` rendering the same header, footer and
image markup the status page uses, with the image at `/images/404.jpg` (the
same path the status pages use, so it also works under `next dev`, where
there's no Nginx to route `/404`). Next renders this component for the
`/_not-found` route and copies it to `out/404.html`.

## Out of scope

- Changing what Nginx returns on a 404 (stays the raw image, which is what
  `<img src="https://http.cat/999">` users rely on).
- A Catalan version of the page. Next has one root not-found page; `/ca/...`
  404s are handled by Nginx like any other.

## Acceptance checks

- [ ] `npm run build` produces `out/404.html` and `out/_not-found.html`
      containing the 404 cat image, checked by a test in
      `tests/build.test.mjs`.
- [ ] After deploy, `/404.html` and `/_not-found` show the cat page (manual).

## Open questions

None.
