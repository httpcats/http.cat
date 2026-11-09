# 0006: Keyboard navigation (h j k l), settings and command line

- **Status:** implemented
- **Issue:** —
- **Affects:** site (Next.js)

## Problem

You can only move through the site's links with Tab, which follows DOM
order one link at a time. On the home page that means tabbing through
every thumbnail in sequence to get to one in the next row, and there's no
way to move up, down, left or right.

Vim-style keys give keyboard users direction: `h` `j` `k` `l` move the
highlight left, down, up and right between the links on the page, and
Enter opens the highlighted one. On the home page, `j` goes from the logo
to the copy button to the first cat, `j` again moves to the cat below it,
`l` to the one next to it, and Enter opens its status page.

Keyboard shortcuts made of single letters need an off switch (see
"Settings"), and the site follows the system's light or dark theme with
no way to choose. Both go in a new settings window, opened from the
footer.

## Behavior

**No URL, response or Nginx change.** This is client-side behavior on the
pages that already exist. The tables in `specs/0000-baseline/spec.md` are
unchanged.

### Keys

| Key | Action |
|---|---|
| `h` | highlight the nearest candidate to the left |
| `j` | highlight the nearest candidate below |
| `k` | highlight the nearest candidate above |
| `l` | highlight the nearest candidate to the right |
| Enter | open the highlighted link (the browser's own behavior, see below) |
| `gg` | go to the top of the page (see "Top and bottom") |
| `G` | go to the bottom of the page |
| `:` | open the command line (see "Command line") |

The keys work on every page: home, status, blog list, blog post,
not-found, and the Catalan versions. They're on by default and can be
turned off in the settings (see "Settings").

"Highlight" means **real keyboard focus**: the key calls `focus()` on the
element. That way:

- Enter needs no code of its own. A focused link opens on Enter like it
  does after Tab. The browser fires a `click`, so Next's client-side
  navigation and the thumbnail's scroll-position saving
  (`components/Thumbnail`) work unchanged. Enter on a focused button
  (e.g. the copy button) presses it.
- The highlight is the focus ring (`:focus-visible`), the same one Tab
  shows, and screen readers follow it.
- Tab and Shift+Tab keep working and carry on from wherever `hjkl` left
  focus, and the other way round.

### Which keys are taken

A key is handled only when all of these are true:

- keyboard navigation is on (see "Settings")
- it's `h`, `j`, `k`, `l` or `g` with no modifier (`event.key` is the
  lowercase letter, and Ctrl, Alt and Meta aren't held), or `G` or `:`
  (Shift allowed). Shift gives an uppercase key, so `H` `J` `K` `L` are
  left alone, and so are browser shortcuts like Ctrl+L or Ctrl+J
- focus isn't in a text field (`input`, `textarea`, `select` or a
  `contenteditable` element). The site has none today; this protects
  future ones
- the event isn't part of an IME composition (`isComposing`) and no other
  handler called `preventDefault()` on it

A handled key gets `preventDefault()`, even when the highlight doesn't
move, so it can't also start Firefox's find-as-you-type. Holding a key
down repeats it, like in vim. Every other key, the arrow keys included,
behaves exactly as it does today.

### Candidates

The elements `hjkl` can move to are the ones Tab reaches: `a[href]` and
`button` elements that aren't disabled, don't have `tabindex="-1"`, and
are visible (a non-empty bounding box, not `visibility: hidden`).
Excluded:

- **the Carbon ad** (anything inside `#carbon-container`). It's
  third-party, and on desktop it's positioned over the top right of the
  page, so it would catch `l` and `k` from the header and the first row of
  cats. Tab still reaches it.

This includes the logo, the copy button, the "back to home" links, links
inside text (status descriptions, blog posts), the footer links and
buttons, and the Settings link.

While the settings window is open, only the elements inside it are
candidates: the rest of the page is inert behind it, as Tab already
treats it.

### Lists

Some pages have a **list**: a container marked with `data-keynav-list`,
whose items are the candidates inside it.

| Page | List |
|---|---|
| `/`, `/ca` | the cat thumbnails (`components/ThumbnailGrid`) |
| `/blog` | the list of posts |
| status pages, blog posts, not-found | none |

Moving into a list from outside it lands on its first item in the row (or
column) being entered. That's what makes `j` from the copy button go to
the first cat rather than the cat under the button (see below).

### Moving

From the focused element's bounding box (`getBoundingClientRect()`), for
`j` (the other keys are the same rule turned around: `k` up, `h` and `l`
with rows and columns swapped):

1. **Candidates below:** the ones whose top is at or below the focused
   element's bottom (with 1px of tolerance for rounding).
2. **The next row:** the candidate below with the smallest gap to the
   focused element, plus every candidate below that overlaps it
   vertically.
3. **Pick one in that row:**
   - if the nearest candidate is in a list the focused element isn't in,
     the first item of that list in the row (DOM order)
   - otherwise, the one with the smallest horizontal gap to the focused
     element (0 when they overlap horizontally, e.g. two cats in the same
     column), ties going to the one earlier in the DOM
4. If there are no candidates below, nothing happens. **No wrapping**: `l`
   on the last cat of a row doesn't go to the next row, and `j` on the
   last link of the page doesn't go back to the top.

On the home page at desktop width, measured in Chromium on 2026-11-07
(left–right, top–bottom in px at 1280px wide): logo 128–397, 16–104; copy
button 1064–1118, 207–247; cats 100, 101, 102 at 128–454, 470–795 and
811–1137, all 353–639. That gives:

- `j` from the logo: the next row is just the copy button, so focus goes
  to the button (not the 100 cat under the logo)
- `j` from the button: the next row is cats 100, 101 and 102, in the grid
  the button isn't in, so focus goes to 100 (not 102, under the button)
- `j` from 100: the next row is 103, 104, 105; 103 overlaps
  horizontally, so focus goes to 103. Likewise 101 → 104, 102 → 105
- `k` from any cat in the first row: the copy button; `k` again: the logo
- `l` from 100: 101; `l` from 102: nothing

The same sequence (logo → button → 100 → the cat below) holds at the
tablet (2 columns, 700px) and phone (1 column, 400px) widths.

Because it's geometric, it follows whatever the page looks like: the home
grid is 3, 2 or 1 columns depending on the screen width, and `j` always
moves to the cat visually below. In the 1-column layout `h` and `l` don't
move within the grid. In a partial last row, `j` from a column with no
cat below goes to the nearest cat in that row.

A known limitation: a link in a paragraph that wraps onto two lines has a
bounding box as wide as the paragraph, so `h`/`l` next to it in blog posts
and status descriptions can pick an unexpected link. Acceptable for prose,
where `j`/`k` are the useful keys.

The focused element is scrolled into view only if it isn't already fully
visible, by the smallest scroll that shows it (`block: 'nearest'`, no
smooth scrolling).

### Where it starts

When focus isn't on a candidate (on page load, after navigating to another
page, after clicking somewhere that isn't a link), any of `h` `j` `k` `l`
focuses the **first candidate in DOM order that's at least partly in the
viewport** (or, if none is, the first candidate on the page), and doesn't
move further.

On every page, scrolled to the top, that's the logo. On the home page,
scrolled halfway down, it's the first cat on screen.

### Top and bottom (`gg`, `G`)

As in vim, `gg` goes to the top of the page and `G` (Shift+G) to the
bottom.

- `gg` is two `g` presses less than a second apart (vim's default
  `timeoutlen`). Any other key in between cancels it; Shift and the other
  modifier keys on their own don't.
- The page scrolls all the way, instantly (no smooth scrolling, like the
  rest of the keyboard navigation).
- If a candidate is highlighted, the highlight moves to the first
  candidate on the page (the logo) for `gg`, or the last one (the end of
  the footer) for `G`, like vim's cursor going to the first or last
  line, so `hjkl` carry on from there. If nothing is highlighted, they
  only scroll, and don't add a highlight.
- They follow "Which keys are taken", and do nothing while a modal window
  (the settings or the command line) is open.

### Settings

The footer gets a **Settings** link after the Blog link, on every page:

> Versió Catalana · Blog · Settings

It's a `<button type="button">` styled like the links next to it (it opens
a window rather than going anywhere). Pressing it opens the **settings
window**: a modal `<dialog>` (opened with `showModal()`) with a title,
two switches and a Close button:

```
┌──────────────────────────────────────┐
│ Settings                             │
│                                      │
│ Vim mode                        [●─] │
│ Dark theme                     [──○] │
│                                      │
│                              Close   │
└──────────────────────────────────────┘
```

- Using the browser's modal dialog gives the expected behavior for free:
  focus moves into the window and stays in it, the page behind is inert,
  Esc closes it, and focus goes back to the Settings link on close. A
  click on the backdrop also closes it, if the press started there too: a
  drag that starts inside the window (e.g. selecting text) and ends on the
  backdrop doesn't.
- Each switch is a `<button type="button" role="switch"
  aria-checked="true|false">` whose text is its label, so it's announced
  as e.g. "Dark theme, switch, off". Pressing it (click, Enter or Space)
  flips it, and the change applies at once; there's no Save button.
- `hjkl` work inside the window (see "Candidates"): `j`/`k` move between
  the switches and the Close button, and Enter flips a switch. Turning
  keyboard navigation off from inside the window stops `hjkl` at once.
- The window uses the site's colors (`--bg-color`, `--text-color`), and a
  switch that's on uses `--interactive`.

Its text comes from new keys in both `locales/en/common.json` and
`locales/ca/common.json`:

| Key | English | Catalan |
|---|---|---|
| `SETTINGS_LINK_TEXT` | `Settings` | `Configuració` |
| `SETTINGS_TITLE` | `Settings` | `Configuració` |
| `SETTINGS_KEYNAV_LABEL` | `Vim mode` | `Mode vim` |
| `SETTINGS_DARK_THEME_LABEL` | `Dark theme` | `Tema fosc` |
| `SETTINGS_CLOSE` | `Close` | `Tanca` |

Both settings are saved in `localStorage`, so they last across pages,
reloads and visits, in both languages. If `localStorage` isn't available
(e.g. blocked), the switches still work until the page is reloaded.

#### Keyboard navigation switch

- Labeled "Vim mode": it turns `hjkl`, `gg`, `G` and the `:` command line
  on and off.
- On by default. Saved as `keynav=off` while it's off; the key is removed
  when it's turned back on.
- While it's off, `hjkl` do nothing at all and aren't `preventDefault`ed.
  Tab and the focus ring are unaffected.

This is the off switch WCAG 2.1 success criterion 2.1.4 (Character Key
Shortcuts, level A) asks for: single-letter shortcuts can be triggered by
accident by people using speech input, so they must be possible to turn
off. The settings window is also where visitors find out the keys exist.

#### Dark theme switch

Today the site is dark when the system is (`prefers-color-scheme`), with
no way to choose. The switch overrides that:

- It shows the theme the page is in: on when the page is dark, whether
  that comes from the system or from an earlier choice.
- Flipping it switches the page's theme at once, and saves the choice
  (`theme=dark` or `theme=light`) **only when it differs from the
  system**. Flipping it back to what the system says removes the saved
  choice, so the site follows the system again (and follows it when the
  system changes, e.g. at night). That way a two-state switch still has a
  way back to "follow the system".
- A saved choice is applied **before the page is first painted**, so a
  visitor who chose light on a dark system doesn't see a flash of dark: a
  small inline script at the top of `<head>` reads `theme` and sets
  `<html data-theme="dark|light">`. Without a saved choice, there's no
  `data-theme` and the site follows the system as it does today.
- The whole site follows it, everything that's dark today: the page,
  inline code and code blocks (including the blog's syntax highlighting,
  which picks GitHub's light or dark colors, spec 0004), the usage box,
  and the ad's colors.
- The browser's own UI (scrollbars, the dialog's backdrop) follows it
  too, through `color-scheme`.

How it's done in CSS: every color that's different in dark mode is
written once, as `light-dark(<light>, <dark>)`, and `color-scheme` on
`<html>` picks the side: `light dark` by default (follows the system),
`light` with `data-theme="light"` and `dark` with `data-theme="dark"`.
This replaces the six `@media (prefers-color-scheme: dark)` blocks
(`app/globals.css` and the Usage, StatusDescription and PostContent
styles), so there's one mechanism and nothing to duplicate per theme.
`light-dark()` is in every current browser (Chrome 123, Firefox 120,
Safari 17.5, all from 2024), and Next's CSS build (Lightning CSS) also
compiles it into CSS variables that older browsers understand, set by
`color-scheme` and a generated `prefers-color-scheme` query. So the built
CSS still has that query; the source stylesheets don't.

### Command line (`:`)

Pressing `:` opens a floating command line, like vim's, in the style of a
launcher such as Alfred or Raycast: a box floating over the page, with a
big text field and the matching commands listed under it.

```
┌──────────────────────────────────────────────────┐
│ : th▌                                            │
├──────────────────────────────────────────────────┤
│ ▸ theme {dark|light}  Switch to the dark or l... │
└──────────────────────────────────────────────────┘
```

#### Opening and closing

- `:` opens it under the same conditions as `hjkl` ("Which keys are
  taken"): keyboard navigation is on, focus isn't in a text field, and
  Ctrl, Alt and Meta aren't held. Shift is allowed, because `:` needs it
  on most keyboards. The check is on `event.key`, so `:` works whatever
  the keyboard layout. It doesn't open while the settings window is open.
- It's a modal `<dialog>`, like the settings window: focus goes into the
  text field, the page behind is inert, and closing gives focus back to
  wherever it was.
- Esc, or a click outside the box, closes it without running anything.
  As in the settings window, a drag from inside the box (e.g. selecting
  the typed text) that ends outside it doesn't.
- It's horizontally centered, about a fifth of the way down the viewport,
  36rem wide at most (the full width minus a margin on phones), with
  rounded corners and a shadow. It uses the site's colors, and the
  selected row is highlighted in `--interactive`.

#### Commands

Commands take one argument, written after them with a space, as in vim
(`:theme dark`), except `blog`, which takes none.

Arguments are written in vim's help notation (`:help notation`): `{}`
around a required argument and `|` between alternatives, so `{code}` is a
value to fill in and `{dark|light}` is one of those two words. Not `<>`,
which vim uses for keys (`<Esc>`, `<CR>`).

| Command | Does |
|---|---|
| `status {code}` | navigates to the status page for `{code}`, e.g. `status 404` goes to `/status/404` (`/ca/status/404` on the Catalan pages), with client-side navigation like a link. `{code}` is any status in `lib/statuses.js` (not the hidden `0`) |
| `blog` | goes to the blog, `/blog` (English only, so from the Catalan pages too, like the footer's blog link) |
| `lang {eng\|cat}` | the page in English or Catalan (ISO 639-2 codes): the same page if it's translated (the home and status pages, e.g. `/status/404` ↔ `/ca/status/404`), else that language's home page (from the blog, `lang cat` goes to `/ca`), like the footer's language link |
| `theme {dark\|light}` | dark or light theme, like flipping the settings' dark theme switch on or off |
| `vim {on\|off}` | the vim keys on or off, like the settings' switch. `vim off` includes `:` itself, so they're turned back on from the settings window |

`theme` and `vim` do exactly what the settings switches do, including how
the theme is saved (only while it differs from the system's). The settings
window shows the new state the next time it's opened.

Command names and values are English in both languages, like vim's. The
descriptions, the placeholder and the error messages are translated
(status names stay English, as on the status pages).

#### Typing and choosing

- The field starts empty, with a `:` drawn in front of it as a prompt
  (it's not part of the text) and a placeholder ("type a command").
- **Commands.** Until a command's full name and a space are typed, the
  list shows each command with its argument and a description, in the
  order of the table above (going somewhere first, starting with
  `status`, the one people will use most; then the settings), with the
  argument in a lighter weight:

  | Row | Description |
  |---|---|
  | `status {code}` | Navigate to a given status |
  | `blog` | Go to the blog |
  | `lang {eng\|cat}` | Switch the language |
  | `theme {dark\|light}` | Switch to the dark or light theme |
  | `vim {on\|off}` | Turn the vim keys on or off |

  An empty field lists them all. Otherwise a command is listed when
  what's typed is the start of its name, like vim's command-line
  completion: `st` lists `status {code}`, `th` and `theme` list
  `theme {dark|light}`; `dark` lists nothing. Tab or Enter on one of these
  rows completes the field to the command and a space (`theme `), ready
  for the argument; it doesn't run anything. `blog` takes no argument,
  so its row runs it.
- **Values.** Once the command and a space are typed, the list is the
  command's values that start with the argument, each with a description
  and in this order: `theme ` lists `theme dark` ("Use the dark theme")
  and `theme light` ("Use the light theme"); `vim ` lists `vim on` and
  `vim off` ("Turn the vim keys on/off"); `lang ` lists `lang eng`
  ("English") and `lang cat` ("Català"), each language's name in that
  language; `status ` lists every status
  with its name, `status 4` the 4xx, `status 40` 400 to 409, `status 404`
  just 404. A row says which value is the **current** state (the page's
  theme, whether the vim keys are on, the page's language, the status page
  you're on, or `blog` on the blog). The list
  scrolls when it's long (at most 20rem or half the viewport high),
  keeping the selected row in view.
- Matching ignores case, spaces at the start and end, and repeated spaces:
  `THEME D` and `  vim   o ` work.
- The first row is selected. ↑ and ↓ (and Ctrl+P and Ctrl+N, as in vim)
  move the selection, Tab completes the field to the selected row, and a
  click on a row picks it like Enter. The selection wraps around at either
  end, like vim's completion menu. Chrome keeps Ctrl+N for itself (a new
  window) and never passes it to pages, so there only ↓ moves down.
- Enter on a value runs the command, closes the box, and the change
  applies at once (for `status`, the page opens).
- If nothing matches, the list is replaced by one of vim's error messages,
  and Enter does nothing more; the box stays open to fix the command:
  - `E474: Invalid argument: <argument>` for a command with a value it
    doesn't take (`theme blue`, `vim yes`, `lang fr`, `status 999`,
    `status abc`)
  - `E488: Trailing characters: <argument>` for `blog` with an argument
    (`blog x`), since it takes none
  - `E492: Not an editor command: <what was typed>` for anything that
    isn't the start of a command (`foo`, `dark`, `st 404`, `blogs`)

#### Accessibility

The field and the list follow the ARIA combobox pattern: the field has
`role="combobox"`, `aria-expanded`, `aria-controls` pointing at the list
and `aria-activedescendant` pointing at the selected row; the list is a
`role="listbox"` of `role="option"` rows with `aria-selected`. The error
is in an `aria-live="polite"` region, so it's announced. `hjkl` don't
move focus while the box is open (the field is a text field).

#### Text

New keys in both `locales/en/common.json` and `locales/ca/common.json`:

| Key | English | Catalan |
|---|---|---|
| `COMMAND_LABEL` | `Command` | `Ordre` |
| `COMMAND_PLACEHOLDER` | `type a command` | `escriviu una ordre` |
| `COMMAND_CURRENT` | `current` | `actual` |
| `COMMAND_STATUS` | `Navigate to a given status` | `Navega fins a un estat` |
| `COMMAND_BLOG` | `Go to the blog` | `Ves al blog` |
| `COMMAND_LANG` | `Switch the language` | `Canvia l'idioma` |
| `COMMAND_LANG_ENG` | `English` | `English` |
| `COMMAND_LANG_CAT` | `Català` | `Català` |
| `COMMAND_THEME` | `Switch to the dark or light theme` | `Canvia al tema fosc o clar` |
| `COMMAND_THEME_DARK` | `Use the dark theme` | `Fes servir el tema fosc` |
| `COMMAND_THEME_LIGHT` | `Use the light theme` | `Fes servir el tema clar` |
| `COMMAND_VIM` | `Turn the vim keys on or off` | `Activa o desactiva les tecles de vim` |
| `COMMAND_VIM_ON` | `Turn the vim keys on` | `Activa les tecles de vim` |
| `COMMAND_VIM_OFF` | `Turn the vim keys off` | `Desactiva les tecles de vim` |
| `COMMAND_NOT_FOUND` | `E492: Not an editor command` | `E492: No és una ordre d'edició` |
| `COMMAND_INVALID_ARGUMENT` | `E474: Invalid argument` | `E474: L'argument no és vàlid` |
| `COMMAND_TRAILING_CHARACTERS` | `E488: Trailing characters` | `E488: Sobren caràcters` |

(`COMMAND_LABEL` is the field's accessible name. The Catalan errors are
vim's own Catalan translations, checked against Neovim's catalog on
2026-11-09.)

### Highlight style

Today a focused thumbnail shows **no focus ring at all**: the ring is
drawn outside the link, and the card around it has `overflow-hidden`, so
it's clipped. (Checked in Chromium on 2026-11-07: after tabbing to the
100 cat the link matches `:focus-visible`, but nothing on screen
changes.) This is already a problem for Tab users, and `hjkl` would be
unusable without fixing it:

- the card (the thumbnail's outer `div`) gets a visible ring when its link
  has `:focus-visible`, e.g. Tailwind's `has-[:focus-visible]:` variant,
  readable in light and dark mode
- the image goes to full contrast, like on hover

Other candidates keep the browser's default focus ring, moved 2px off the
element (`outline-offset` on `:focus-visible` in `app/globals.css`, the
same gap as the thumbnails' ring): drawn right on the edge, it touched the
logo and the text of links. More would run into the next line of a list.

The header's logo link was taller than its content (the title's margins
were inside it), so its ring reached down to the "back to home" link. The
header now has the spacing instead, and the link's box hugs the logo and
title with 4px of padding (`p-1 -m-1`, so nothing on the page moves).

The "back to home" and "back to blog" links at the top of the status, blog
list, blog post and not-found pages become a red outline pill with an arrow
(`components/BackLink`), filled red on hover and on keyboard focus, so it's
clearly a link and its highlight is clear too. The text and targets don't
change.

### Implementation

- `lib/spatial-nav.ts`: pure functions with no DOM access, the part that
  can be unit tested:
  - `pickNext(direction, from, candidates)`: the "Moving" rules, over
    plain `{ rect: { top, right, bottom, left }, list }` items (`list`
    identifies the list the element is in, or is `null`), returning the
    index of the candidate to focus or `-1`
  - `pickStart(candidates, viewport)`: the "Where it starts" rule
  Written with erasable TypeScript only (no `enum` or `namespace`), so the
  Node 26 test runner can import it directly (checked: `node --test`
  imports a `.ts` file from a `.mjs` test with no setup).
- `lib/keynav-setting.ts`: `isKeynavEnabled()` and
  `setKeynavEnabled(on)`, reading and writing `localStorage` inside
  `try`/`catch`, with an in-memory fallback, and `subscribeKeynav()` for
  `useSyncExternalStore`.
- `lib/theme-setting.ts`: `isDarkTheme()`, `setDarkTheme(dark)` (sets
  `data-theme`, and saves or removes `theme` as described above) and
  `subscribeTheme()` (changes from the settings, other tabs, and the
  system preference), plus the source of the inline `<head>` script.
- `components/KeyboardNav/KeyboardNav.tsx`: a `'use client'` component that
  renders nothing. It adds one `keydown` listener to `document`, applies
  "Which keys are taken" (checking `isKeynavEnabled()` on each key, so a
  change in the settings applies at once), collects the candidates (inside
  the open modal `dialog` if there is one, else the whole document), their
  rects and lists, calls `pickNext` or `pickStart`, and focuses the result
  (`focus({ preventScroll: true })`, then `scrollIntoView({ block:
  'nearest' })`).
- `components/SiteLayout.tsx` renders `<KeyboardNav />` once, and the
  theme script at the top of `<head>`. Both root layouts and
  `app/global-not-found.tsx` use `SiteLayout`, so every page gets them.
  The layout stays mounted across client-side navigations, so there's a
  single listener for the whole visit. `<html>` gets
  `suppressHydrationWarning`, since the script may add `data-theme` before
  React hydrates.
- `components/Settings/`: the Settings link and the settings window,
  rendered by `components/Footer/Footer.tsx`.
- `lib/commands.ts`: the commands as data (name, argument, description
  key, values) and `matchCommands(input, statuses)`, the matching rules
  above, returning the rows to list or the error to show. No DOM access (the statuses are
  passed in), so it's unit tested. `components/CommandLine` runs the
  commands and knows which is current.
- `lib/site.ts`: `pathInLanguage(pathname, locale)`, the page's path in
  the other language for `lang`, next to the existing rules for which
  pages are translated. Unit tested in `tests/site.test.mjs`.
- `lib/shortcuts.ts`: the "Which keys are taken" checks, shared by
  `KeyboardNav` and the command line.
- `components/CommandLine/`: the `:` listener and the command line
  dialog, rendered once by `components/SiteLayout.tsx` next to
  `<KeyboardNav />`.
- `app/globals.css` and the Usage, StatusDescription and PostContent
  styles: `light-dark()` and `color-scheme` instead of the media queries.
- `data-keynav-list` on the `<ul>` in `components/ThumbnailGrid` and on the
  post list in `app/(en)/blog/page.tsx`.
- The highlight style in `components/Thumbnail/Thumbnail.tsx`.
- `components/BackLink/`: the back link pill, used by the status, blog and
  not-found pages.
- `lib/use-backdrop-close.ts`: closing the settings window and the command
  line on a click on the backdrop, shared by both.
- No new dependency.

### Known interactions

- **Vim browser extensions** (Vimium, Tridactyl, Surfingkeys...) already use
  `hjkl` (usually for scrolling) and see keys before the page does. Their
  users get the extension's behavior unless they exclude http.cat in it.
  Nothing the site can or should do about that.
- **Screen readers** in browse mode (NVDA, JAWS) use `h`, `k` and `l` for
  their own quick navigation (headings, links, lists) and don't pass them
  to the page. The page only gets them in focus mode. No conflict.

## Consequences in the repo

- `tests/spatial-nav.test.mjs`: unit tests for `lib/spatial-nav.ts` (picked
  up by `npm test`'s `tests/*.test.mjs`).
- `tests/build.test.mjs`: the list markers, the Settings link and window,
  and the theme script are in the built pages, and no source stylesheet
  uses `prefers-color-scheme` any more.
- `locales/{en,ca}/common.json`: the `SETTINGS_*` and `COMMAND_*` keys.
- `tests/commands.test.mjs`: unit tests for `lib/commands.ts`.
- `tests/site.test.mjs`: unit tests for `pathInLanguage`.
- README: one line saying the site can be navigated with `hjkl`, `gg`, `G`
  and the `:` command line, and that the vim keys and the dark theme can be
  set in the footer's settings.
- `specs/0004-blog/spec.md`: the syntax highlighting colors follow the
  site's theme (this spec) rather than `prefers-color-scheme` directly.
- `specs/0000-baseline/spec.md`: no change (no URL behavior changes).

## Out of scope

- Other vim keys: `/`, `n`, counts (`5j`), Ctrl+D/Ctrl+U, Esc to
  clear the highlight.
- Scrolling with `j`/`k` (Vimium style). The keys move the highlight; the
  page scrolls only to keep it visible.
- Arrow keys: they keep scrolling the page.
- Remapping keys.
- A help overlay (`?`) listing the keys.
- Touch screens: no keyboard, no change.
- Highlighting the cat you came from when going back to the home page.
  Possible later: thumbnails already have `id="<code>"`, and
  `components/ScrollRestore` already restores the scroll position.
- Navigating inside the Carbon ad.
- A settings page or URL: the settings are only a window, opened from the
  footer.
- Commands other than the five above, e.g. `:404` as a shorthand for
  `:status 404`, `:q` to close the command line, or `:help`. They're easy
  to add to `lib/commands.ts` later.
- Finding a status by name in `:status` (e.g. `status teapot`): only codes.
- Command history (↑ in an empty field recalling the last command, as in
  vim).
- A way to open the command line without a keyboard (touch screens): the
  settings window already has everything it can do.
- A three-way theme choice (system / light / dark): the dark theme switch
  goes back to following the system when it's flipped back to match it.
- Other settings.

## Acceptance checks

Layout doesn't exist in jsdom (`getBoundingClientRect()` returns zeros), so
the movement rules are unit tested on synthetic rects, and the behavior in
a real browser is checked by hand.

- [x] Unit tests (`tests/spatial-nav.test.mjs`), using the home page rects
      measured above (logo, copy button, a 3-column grid as a list): `j`
      goes logo → button → 100 → 103; `k` from 102 goes to the button,
      then the logo; `l`/`h` move along a row and return `-1` at its ends
      (no wrap); `j` over a partial last row goes to the nearest cat in
      it; in a 1-column grid `h`/`l` return `-1`; on a single line of
      inline links (like the footer) `l`/`h` move along it; equal gaps go
      to the earlier candidate. The same logo → button → 100 sequence with
      the 700px and 400px rects.
- [x] Unit tests: `pickStart` returns the first candidate at least partly
      in the viewport, and the first candidate when none is.
- [x] Unit tests (`tests/commands.test.mjs`): an empty input lists the
      five commands in order (`status`, `blog`, `lang`, `theme`, `vim`)
      with their arguments; `st`, `b`, `l`, `th`, `theme` and `V` list the
      right command; `theme `, `theme d`, `vim `, `vim o`, `vim off`,
      `lang `, `lang c`, `lang en`, `status `, `status 4`, `status 40` and
      `status 404` list the right values in order; `blog` and `blog ` list
      `blog`, ready to run; case and spaces are ignored; `dark`, `th d`,
      `foo`, `themes`, `statuses 404`, `st 404`, `blogs` and `language`
      give E492; `theme blue`, `theme x`, `vim offf`, `vim yes`, `lang fr`,
      `lang catalan`, `status 999`, `status 4040`, `status abc` and
      `status 0` give E474; `blog x` gives E488; every description and
      error has its text in both locales.
- [x] Unit tests (`tests/site.test.mjs`): `pathInLanguage` maps the home
      and status pages to the same page in the other language, leaves a
      page in its own language where it is, and sends the blog and
      unknown pages to that language's home page.
- [x] Build test: `out/index.html`, `out/ca.html` and `out/blog.html` have
      `data-keynav-list`; the home, Catalan home, status, blog and
      not-found pages have the Settings link and the settings window with
      the text in their language, the command line (its field and the
      command list), and the theme script in `<head>`; no
      source stylesheet (`app/`, `components/`) has a
      `prefers-color-scheme` media query (the build generates one, see
      "Dark theme switch"); both locale files have the new keys (the
      existing same-keys check).
- [x] `npm run lint` passes.
- [ ] Manual (`npm run dev` or the Nginx container), in Chrome and
      Firefox:

      Run on 2026-11-09 in Firefox 158 and Chromium, headless, by a script
      driving real key presses and mouse events against the static build
      (Carbon ad and analytics blocked, since the ad loading shifts the
      restored scroll position by ~104px on `master` too). The open items
      below are the parts a headless browser can't show.
  - [x] home at desktop width, scrolled to the top: `j` highlights the
        logo, then the copy button, then the 100 cat; `j` `k` `h` `l` move
        between cats as they appear on screen; `l` at the end of a row and
        `h` at its start do nothing; Enter opens the highlighted cat's
        status page; going back restores the scroll position as before
  - [x] home at tablet (2 columns) and phone (1 column) widths: same
        start sequence; `j`/`k` follow the columns; scrolled halfway down,
        the first `j` highlights a cat on screen
  - [x] Enter on the copy button copies the URL; `j` from the last row
        reaches the footer
  - [x] status page, blog list, a blog post, the not-found page, and `/ca`:
        `hjkl` move between the links, and Enter opens them
  - [x] the highlight is visible when it's moved by `hjkl` (not only by
        Tab); the highlighted thumbnail is clearly visible in light and
        dark mode; every other candidate's focus ring is visible
  - [x] the Settings link opens the settings window; Esc, the Close
        button and a click on the backdrop close it, and focus goes back
        to the Settings link; a drag from inside the window that ends on
        the backdrop doesn't close it; Tab and `hjkl` stay inside the
        window while it's open
  - [x] the keyboard navigation switch: turning it off stops `hjkl`
        immediately, and it stays off after navigating, reloading, and
        switching to `/ca` (with the Catalan text); turning it back on
        works the same way
  - [ ] the dark theme switch, on a light system and on a dark system:
        it starts in the state matching the page; flipping it changes the
        whole page at once (page, usage box, status description code, a
        blog post's code blocks, the ad); the choice survives navigating
        and reloading with no flash of the other theme; flipping it back
        removes the saved `theme`, and the page then follows a change of
        the system preference
        (all checked in both browsers, except following a live change of
        the system preference: only in Chromium, since Firefox can't
        emulate it over WebDriver BiDi)
  - [x] with no saved settings, the site looks as it did before in both
        system themes
  - [x] `gg` and `G`: from the middle of the home page, `G` goes to the
        bottom and `gg` to the top, instantly; with a cat highlighted, the
        highlight moves to the last footer link or the logo, and `j`/`k`
        carry on from there; with nothing highlighted, nothing gets
        highlighted; `g`, a pause of more than a second, then `g` does
        nothing; `g` `j` moves the highlight; neither works while typing,
        in a modal window, or with vim keys off
  - [ ] the command line: `:` opens it on every page (with a US and a
        non-US keyboard layout), not while typing in a text field or with
        the settings window open, and not with keyboard navigation off;
        Esc and a click outside close it and focus goes back where it was;
        selecting the typed text by dragging past the box doesn't close it
        (all checked in both browsers except the non-US layout; the code
        only reads `event.key`)
  - [x] typing filters the list, ↑/↓ and Ctrl+P/Ctrl+N move the
        selection, Tab and Enter on a command complete it (`theme `),
        Enter and a click on a value run it; `theme dark`/`theme light`
        change the theme at once and the settings window then shows it;
        `vim off` stops `hjkl` and `:`; `theme blue` shows E474 and `foo`
        E492, and the box stays open
  - [x] `status`: `status ` lists every status and `status 4` the 4xx,
        and the selection stays in view when moving through the long
        list; `status 404` and Enter opens `/status/404` (and
        `/ca/status/418` from `/ca`), where it's then marked current
  - [x] `lang`: `lang cat` on `/status/418` opens `/ca/status/418` and
        `lang eng` brings it back; from the blog, `lang cat` opens `/ca`;
        the page's language is marked current
  - [x] `blog`: opens `/blog` from English and Catalan pages, where it's
        then marked current; `blog x` shows E488
  - [x] the current state is marked in the list; the box looks right in
        light and dark, on desktop and on a phone-width window; Catalan
        text on `/ca`
  - [ ] Shift+J, Ctrl+L and Ctrl+J do what they did before; the arrow
        keys still scroll
        (checked: the page doesn't take them, and the arrow keys scroll;
        the browser's own Ctrl+L and Ctrl+J aren't visible headless)
- [x] README updated.

## Open questions

None. Resolved 2026-11-08 (the command line):

- **`:` with keyboard navigation off:** off too. It's a single-character
  shortcut like `hjkl`, so the same WCAG 2.1.4 off switch covers it, and
  `vim off` turns all the vim keys off. The settings switch is relabeled
  "Vim keys (h j k l and :)" to say so (and "Vim keys (h j k l, gg, G
  and :)" since `gg` and `G` were added on 2026-11-09). Shortened to "Vim
  mode" on 2026-11-09: the list of keys made the label long, and "vim mode"
  already says it covers all of them.
- **Unknown commands:** vim's own message, `E492: Not an editor command:
  foo`.
- **Matching:** what's typed must be the start of the command, like vim
  (`dark` finds nothing), rather than matching the start of any word.

Resolved 2026-11-07:

- **Where it starts:** at the logo; `j` then goes to the copy button and
  then the first cat. Hence the "next row first" movement rule and the
  list rule (the first draft's rule would have gone logo → 100, and
  button → 102). Two details weren't asked about directly and follow the
  same rule: any of `hjkl` starts (not only `j`), and when scrolled down
  it starts at the first candidate on screen rather than scrolling back
  up to the logo.
- **Candidates:** everything Tab reaches, buttons included.
- **Edges:** no wrapping.
- **Off switch:** a toggle in the footer, for now. Replaced on 2026-11-08
  by a Settings link in the footer opening a settings window, with
  switches for keyboard navigation and the dark theme.
