# Specs

This project uses lightweight spec-driven development: behavior changes are
agreed on in a short spec before any code is written, and each spec ends with
acceptance checks that prove the implementation is done.

## When to write a spec

Write a spec for:

- New features (e.g. a new URL, a new response format, a new page)
- Changes to existing behavior (anything that changes what a URL returns)
- Changes to the Nginx config in `deploy/nginx/`

You don't need a spec for:

- Adding a new cat image / status code (follow the README instead)
- Typos, copy and translation fixes
- Dependency upgrades that don't change behavior
- Bug fixes that restore the behavior already described in a spec

## Workflow

1. **Draft:** copy [`_template.md`](_template.md) to `specs/NNNN-short-name/spec.md`,
   using the next free number, and fill it in. Open questions go in the spec.
2. **Approved:** a maintainer reviews the spec and sets its status to `approved`.
   No implementation starts before this.
3. **Implemented:** the code is written, the acceptance checks pass, and the status
   is set to `implemented`. If the implementation had to deviate from the spec,
   update the spec in the same PR.

When a later change alters behavior described in an older spec, update the older
spec too, so the specs always describe how the site behaves today.

## Specs

| Spec | Status |
|---|---|
| [0000 Baseline](0000-baseline/spec.md) | implemented |
| [0001 Route image URLs explicitly in Nginx](0001-image-routing/spec.md) | implemented |
| [0002 Not-found page shows the 404 cat](0002-not-found-page/spec.md) | approved |
