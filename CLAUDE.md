# http.cat

The website at https://http.cat: a static Next.js site with a cat image for each
HTTP status code. There's no server-side code: the "API" (e.g. `/404` returning
the 404 cat image) is implemented in the Nginx config.

## Spec-driven development

New features and behavior changes start as a spec in `specs/`. Read
`specs/README.md` for the process before working on one.

- Don't implement a feature or behavior change until its spec has
  `Status: approved`. If there's no spec yet, write a draft and ask for review.
- Behavior is "done" when the spec's acceptance checks pass. Update the spec in
  the same change if the implementation had to deviate from it.
- `specs/0000-baseline/spec.md` describes the URLs the site serves today and the
  invariants they rely on. Any change that alters those tables must update them.
- Small changes (new cat images, typos, translations, dependency bumps) don't
  need a spec.

## Commands

- `npm run dev`: local dev server
- `npm run build`: static export to `out/` (runs `scripts/post-build.js` after)
- `npm test`: content and build output checks (run `npm run build` first)
- `npm run lint`: ESLint

## How it fits together

- `lib/statuses.js`: the list of statuses shown on the site. It's CommonJS so the
  Node scripts in `scripts/` can reuse it.
- `content/<code>.md` and `content/ca/<code>.md`: status descriptions (English
  and Catalan), rendered by `lib/status-info.ts`.
- `locales/{en,ca}/common.json`: UI strings. Both files must have the same keys.
- `public/images/` (served) and `public/images-original/` (originals): one
  `<code>.jpg` per status. `0.jpg` is a hidden easter egg not in `statuses.js`.
- `app/`: pages. `app/ca/` mirrors the English pages for Catalan.
- `deploy/nginx/http.cat.conf`: production Nginx config, the source of truth.
  Its `try_files` order is load-bearing (see the comments in the file and
  issue #267). It isn't deployed automatically: changes have to be copied to
  the server by the maintainer.
- `integrations/`: snippets for using HTTP Cats in other tools (not deployed).

## Deploying

`npm run deploy` (`scripts/deploy.sh`) rsyncs `out/` to the server and purges
the Cloudflare cache. Without a purge, Cloudflare keeps serving old responses,
including old redirects and 404s. Never run a deploy or purge without the
maintainer asking for it.

## Adding a status

Follow the README: add the image to both `public/images/` and
`public/images-original/`, add the status to `lib/statuses.js`, and add
`content/<code>.md` plus a Catalan translation in `content/ca/<code>.md`.
`npm test` checks that all of these exist.
