// The geometry behind keyboard navigation (specs/0006-keyboard-navigation):
// which element h/j/k/l move to. No DOM access, so it's unit tested on plain
// rects in tests/spatial-nav.test.mjs. components/KeyboardNav does the DOM
// side. Erasable TypeScript only, so Node can run it without a build step.

export type Direction = 'left' | 'down' | 'up' | 'right';

export type Rect = { top: number; right: number; bottom: number; left: number };

// `list` identifies the data-keynav-list container the element is in, or is
// null when it isn't in one
export type Item = { rect: Rect; list: number | null };

export type Viewport = { width: number; height: number };

// rounding in the layout can leave adjacent boxes overlapping by a fraction
const TOLERANCE = 1;

// Turn a rect so that moving in `direction` becomes moving down: "below" is
// then the only case to handle, and left/right are the cross axis.
const turn = (r: Rect, direction: Direction): Rect => {
  switch (direction) {
    case 'down':
      return r;
    case 'up':
      return { top: -r.bottom, bottom: -r.top, left: r.left, right: r.right };
    case 'right':
      return { top: r.left, bottom: r.right, left: r.top, right: r.bottom };
    case 'left':
      return { top: -r.right, bottom: -r.left, left: r.top, right: r.bottom };
  }
};

// The index in `candidates` to move to from `from`, or -1 to stay put.
// `candidates` are in DOM order, and may include `from` itself.
export function pickNext(direction: Direction, from: Item, candidates: Item[]): number {
  const f = turn(from.rect, direction);

  const below = candidates
    .map((c, index) => ({ index, list: c.list, r: turn(c.rect, direction) }))
    .filter((c, index) => candidates[index] !== from && c.r.top >= f.bottom - TOLERANCE);
  if (below.length === 0) return -1;

  // the next row: the nearest candidate, and everything level with it
  const gap = (c: (typeof below)[number]) => c.r.top - f.bottom;
  const nearest = below.reduce((best, c) => (gap(c) < gap(best) ? c : best));
  const row = below.filter(
    (c) => c === nearest || (c.r.top < nearest.r.bottom && c.r.bottom > nearest.r.top),
  );

  // moving into a list from outside it lands on the list's first item in the row
  if (nearest.list !== null && nearest.list !== from.list) {
    return row.find((c) => c.list === nearest.list)!.index;
  }

  // otherwise the one most in line with `from` (0 when they overlap)
  const across = (c: (typeof below)[number]) =>
    Math.max(0, c.r.left - f.right, f.left - c.r.right);
  return row.reduce((best, c) => (across(c) < across(best) ? c : best)).index;
}

// The index to start from when nothing is focused: the first candidate at
// least partly in the viewport, else the first one. -1 when there are none.
export function pickStart(candidates: Item[], viewport: Viewport): number {
  if (candidates.length === 0) return -1;
  const inView = candidates.findIndex(
    ({ rect: r }) =>
      r.bottom > 0 && r.top < viewport.height && r.right > 0 && r.left < viewport.width,
  );
  return inView === -1 ? 0 : inView;
}
