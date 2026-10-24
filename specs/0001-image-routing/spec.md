# 0001: Route image URLs explicitly in Nginx

- **Status:** implemented
- **Issue:** —
- **Affects:** nginx, deploy

## Problem

`/404` returns the 404 cat only because nothing else in the build output is
called `404`. Nginx's `try_files` in `location /` checks `out/404`,
`out/404.html` and `out/404/index.html` before falling back to
`out/images/404.jpg`, so the image API works by absence: any file in `out/`
whose name is a status code silently replaces that cat.

This has already happened once. Next.js generates `out/404.html` (its
not-found page) by default, and the only thing keeping `/404` a cat is
`scripts/post-build.js` deleting that file after every build. A new page named
like a status code, or a future Next.js version emitting `out/404/index.html`,
would break a cat without any error. A test in `tests/build.test.mjs` guarded
against this, but a guard is a weaker fix than stating the rule where it
belongs: in the router.

## Behavior

Nginx routes every all-digit URL, with or without `.jpg`, directly to the image,
regardless of what the build output contains. User-visible behavior is intended
to be identical to the baseline.

| Request | Response |
|---|---|
| `GET /<digits>` | `200`, `image/jpeg`, `public/images/<digits>.jpg` if it exists; otherwise `404` with the 404 cat |
| `GET /<digits>.jpg` | same as above |
| `GET /<digits>/` | `301` to `/<digits>` (unchanged: the trailing-slash rewrite runs first) |
| `GET /0` | `200`, the hidden image (unchanged) |
| `GET /dog`, `/dog.jpg` | `302` to `/400`, `/400.jpg` (unchanged) |
| `GET /404.html` | `200`, Next's not-found page. Before this spec it was the 404 cat, only because `post-build.js` deleted the file; see "Consequences" and spec 0002 |
| Everything else (`/`, `/status/<code>`, `/ca`, static files) | unchanged |

Config change in `deploy/nginx/http.cat.conf`:

```nginx
server {
    # ...

    # moved here from `location /` so the regex location below inherits it
    error_page 404 /images/404.jpg;

    location / {
        # strip trailing slashes (e.g. /status/419/ -> /status/419)
        rewrite ^/(.+)/$ /$1 permanent;

        try_files $uri $uri.html $uri/index.html =404;
    }

    # the image API: /404 and /404.jpg serve public/images/404.jpg, whatever the
    # build output contains
    location ~ ^/(\d+)(\.jpg)?$ {
        try_files /images/$1.jpg =404;
    }

    # easter egg: /dog -> 400 Bad Request cat
    location ~ ^/dog(\.jpg)?$ {
        return 302 /400$1;
    }
}
```

Notes on the change:

- `error_page` must move to the `server` block. A `location` that doesn't set
  its own inherits the server's; if it stayed inside `location /`, `/999` would
  return Nginx's plain 404 page instead of the 404 cat.
- `/images/$uri` and `/images/$uri.jpg` are removed from the `location /`
  chain, since the regex location now covers every URL they served. Removing
  them is what makes the build output unable to shadow an image.
- Regex locations are checked before `location /`, and in file order among
  themselves. `^/(\d+)` and `^/dog` can't both match one URL, so their order
  doesn't matter.
- Simulated against the current build output (2,297 URLs: every file, every
  page with and without a trailing slash, every image, plus unknown and edge
  cases such as `/00404`, `/4040`, `/404.png`, `/404.jpg.jpg`): the only URL
  whose response changes is `/404.html`, as listed above.

## Consequences in the repo

Once this is deployed:

- `scripts/post-build.js` stops deleting `out/404.html`. The deletion only
  existed to keep `/404` a cat under the old `try_files` order; with this
  spec the file can't shadow anything. Next always writes it (there's no
  option not to), and spec 0002 makes the page it contains show the 404 cat.
- `/404.html` is added to the static files table in
  `specs/0000-baseline/spec.md`.
- The "nothing in the build output would replace an image URL" test in
  `tests/build.test.mjs` is removed, since the property it guards no longer
  matters. In its place, two tests check that the Nginx config keeps the
  image location and the server-level `error_page`, and one checks that no
  top-level page in `out/` is named like a status code (it could never be
  reached), with `404.html` as the only exception.
- The shadowing invariant in the "Invariants these rely on" section of
  `specs/0000-baseline/spec.md` is replaced by one saying image URLs don't
  depend on the build output.

## Out of scope

- Any new URL or response format. A `.json` URL doesn't match
  `^/(\d+)(\.jpg)?$`; the JSON responses have their own location, see
  spec 0003.
- Changing which URLs return the 404 cat for non-image requests.
- Automating the deploy of the Nginx config. As with every nginx change, the
  maintainer copies the file to the server, runs `nginx -t`, reloads, and purges
  the Cloudflare cache.

## Implementation order

The Nginx change must be live before the repo changes land, because
`npm run deploy` syncs `out/` independently of the manual Nginx deploy:

1. Deploy the new Nginx config and run the acceptance checks below.
2. Only then change the repo: stop deleting `out/404.html`, remove the
   shadowing test, update the baseline. Until step 1 is live, the old
   `try_files` order would serve `out/404.html` for `/404`, and the shadowing
   test is what guards against exactly that.

## Acceptance checks

- [x] `nginx -t` passes on the server with the new config. (2026-10-14)
- [x] After reload and Cloudflare purge, these return as listed (manual, with
      `curl -sI`): `/404` (200 jpeg), `/404.jpg` (200 jpeg), `/404/` (301 →
      `/404`), `/0` (200 jpeg), `/999` (404 jpeg), `/dog` (302 → `/400`),
      `/status/404` (200 html), `/nope` (404 jpeg), `/` (200 html),
      `/404.html` (200 html). (2026-10-14, all as listed; `/404` body
      byte-identical to `public/images/404.jpg`)
- [x] With `out/404.html` present on the server, `/404` still returns the
      cat. This is the property the change exists for; checked once manually
      by placing the file, then removed. (2026-10-14)
- [x] `npm run build && npm test` passes with the shadowing test removed.
      (2026-10-14)

## Open questions

None. Resolved 2026-10-14:

- **Keep deleting `out/404.html` in `post-build.js`?** No. The goal is that
  every 404 on http.cat shows the site's own 404 cat. The cat on error
  responses comes from `error_page 404 /images/404.jpg`, not from the
  deletion, and under this spec `/404` is a cat either way. The deletion only
  hid Next's default not-found page at `/404.html`, and incompletely: the same
  page is served at `/_not-found` today. Rather than hide that page, spec 0002
  makes it show the 404 cat, so no non-cat 404 exists anywhere on the site.
