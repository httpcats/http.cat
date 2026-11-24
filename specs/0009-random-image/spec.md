# 0009: Random cat image endpoint

- **Status:** draft
- **Issue:** [#255](https://github.com/httpcats/http.cat/issues/255)
- **Affects:** nginx, deploy
- **Depends on:** [Image routing](../0001-image-routing/spec.md), [Image CORS](../0008-image-cors/spec.md)

## Problem

Visitors and HTTP clients have to choose a status code before they can request
a cat. `/random` lets them discover cats without maintaining a list of codes.

## Behavior

| Request | Response |
|---|---|
| `GET /random` | `302` to a relative `/<code>` JPEG URL with `Cache-Control: no-store` and `Access-Control-Allow-Origin: *`. |
| `HEAD /random` | Same redirect and headers as GET, with an empty body. |
| `GET /random/` | `301` to `/random` via the site's trailing-slash rule. |

Each request picks independently from the codes in `lib/statuses.js`. The same
code can appear twice in a row. Every destination serves a JPEG, including
`/404`, which serves the 404 cat with HTTP status `200`.

## Acceptance checks

- [ ] `npm test` verifies that the generated Nginx table matches the catalog.
- [ ] The local HTTPS smoke suite verifies the redirect, cache and CORS headers,
      HEAD, and distinct selections from repeated GETs to the same URL. All
      selected targets resolve to listed JPEGs.
- [ ] After deployment, purge the cached `/random` response and manually repeat
      GETs through Cloudflare. Verify different targets and that Cloudflare
      forwards `no-store` and serves no cache hits. Set a cache bypass for
      `/random` if an existing rule overrides the origin headers.

## Open questions

- Does the generated `split_clients` table fit how the project deploys new
  cats? It uses stock Nginx and keeps the existing single-file config rollout.
