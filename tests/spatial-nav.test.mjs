// Keyboard navigation geometry (specs/0006-keyboard-navigation). The rects
// are the home page's, measured in Chromium on 2026-11-07, so these tests
// follow what the keys actually do there.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { pickNext, pickStart } from '../lib/spatial-nav.ts';

const rect = (left, top, right, bottom) => ({ left, top, right, bottom });

// The home page: logo, copy button, then `count` cats in a grid (list 0)
// with the given column x ranges, card height and gap. Returns the items in
// DOM order and a lookup by name ('logo', 'button', or the cat's position).
const homePage = ({ logo, button, columns, gridTop, height, gap, count }) => {
  const items = [
    { rect: rect(...logo), list: null },
    { rect: rect(...button), list: null },
  ];
  for (let i = 0; i < count; i++) {
    const [left, right] = columns[i % columns.length];
    const top = gridTop + Math.floor(i / columns.length) * (height + gap);
    items.push({ rect: rect(left, top, right, top + height), list: 0 });
  }
  const at = (name) => (name === 'logo' ? 0 : name === 'button' ? 1 : name + 2);
  return { items, at };
};

const desktop = homePage({
  logo: [128, 16, 397, 104],
  button: [1064, 207, 1118, 247],
  columns: [[128, 454], [470, 795], [811, 1137]],
  gridTop: 353,
  height: 286,
  gap: 16,
  count: 8, // a partial last row: 3, 3, 2
});

const tablet = homePage({
  logo: [64, 148, 333, 236],
  button: [548, 339, 602, 379],
  columns: [[64, 335], [351, 621]],
  gridTop: 504,
  height: 255,
  gap: 16,
  count: 6,
});

const phone = homePage({
  logo: [16, 148, 285, 236],
  button: [338, 324, 365, 344],
  columns: [[16, 369]],
  gridTop: 468,
  height: 302,
  gap: 16,
  count: 4,
});

// Press `keys` starting from the item named `start`; returns the names of
// the items visited (or -1 when a key didn't move)
const press = ({ items, at }, start, keys) => {
  const name = (index) => (index === 0 ? 'logo' : index === 1 ? 'button' : index - 2);
  let current = at(start);
  return [...keys].map((key) => {
    const direction = { h: 'left', j: 'down', k: 'up', l: 'right' }[key];
    const next = pickNext(direction, items[current], items);
    if (next === -1) return -1;
    current = next;
    return name(next);
  });
};

describe('pickNext', () => {
  test('j goes logo → copy button → first cat → the cat below, at every width', () => {
    assert.deepEqual(press(desktop, 'logo', 'jjj'), ['button', 0, 3]);
    assert.deepEqual(press(tablet, 'logo', 'jjj'), ['button', 0, 2]);
    assert.deepEqual(press(phone, 'logo', 'jjj'), ['button', 0, 1]);
  });

  test('j and k follow the columns in the grid', () => {
    assert.deepEqual(press(desktop, 1, 'jk'), [4, 1]);
    assert.deepEqual(press(desktop, 2, 'jk'), [5, 2]);
    assert.deepEqual(press(tablet, 1, 'jj'), [3, 5]);
  });

  test('k from the first row goes to the copy button, then the logo, then nowhere', () => {
    assert.deepEqual(press(desktop, 2, 'kkk'), ['button', 'logo', -1]);
    assert.deepEqual(press(desktop, 0, 'k'), ['button']);
  });

  test('h and l move along a row and stop at its ends (no wrapping)', () => {
    assert.deepEqual(press(desktop, 0, 'lll'), [1, 2, -1]);
    assert.deepEqual(press(desktop, 2, 'hhh'), [1, 0, -1]);
    assert.deepEqual(press(desktop, 5, 'l'), [-1]);
  });

  test('j stops at the last row (no wrapping)', () => {
    assert.deepEqual(press(desktop, 6, 'j'), [-1]);
  });

  test('j over a partial last row goes to the nearest cat in it', () => {
    // row 2 has cats 3, 4, 5; the last row only 6 and 7
    assert.deepEqual(press(desktop, 5, 'j'), [7]);
  });

  test('h and l do nothing in a 1-column grid', () => {
    assert.deepEqual(press(phone, 1, 'h'), [-1]);
    assert.deepEqual(press(phone, 1, 'l'), [-1]);
  });

  test('h and l move along a line of inline links', () => {
    const footer = [
      { rect: rect(500, 2000, 610, 2020), list: null },
      { rect: rect(625, 2000, 660, 2020), list: null },
      { rect: rect(675, 2000, 900, 2020), list: null },
    ];
    assert.equal(pickNext('right', footer[0], footer), 1);
    assert.equal(pickNext('right', footer[1], footer), 2);
    assert.equal(pickNext('right', footer[2], footer), -1);
    assert.equal(pickNext('left', footer[2], footer), 1);
    assert.equal(pickNext('left', footer[0], footer), -1);
  });

  test('equal gaps go to the earlier candidate', () => {
    const from = { rect: rect(0, 0, 100, 10), list: null };
    const items = [
      from,
      { rect: rect(0, 20, 50, 30), list: null },
      { rect: rect(50, 20, 100, 30), list: null },
    ];
    assert.equal(pickNext('down', from, items), 1);
  });

  test('moving into a list lands on its first item in the row, from any side', () => {
    const items = [
      { rect: rect(0, 0, 100, 20), list: null }, // a link above, on the left
      { rect: rect(400, 0, 500, 20), list: null }, // a link above, on the right
      { rect: rect(0, 50, 100, 100), list: 0 },
      { rect: rect(400, 50, 500, 100), list: 0 },
      { rect: rect(400, 150, 500, 170), list: null }, // a link below, on the right
    ];
    assert.equal(pickNext('down', items[1], items), 2);
    assert.equal(pickNext('up', items[4], items), 2);
    // inside the list, the usual rule: the one in line
    assert.equal(pickNext('down', items[3], items), 4);
  });
});

describe('pickStart', () => {
  const viewport = { width: 1280, height: 900 };

  test('starts at the first candidate in the viewport', () => {
    assert.equal(pickStart(desktop.items, viewport), desktop.at('logo'));
  });

  test('scrolled down, starts at the first candidate on screen', () => {
    // scrolled by 700px: the logo, the button and the first row are above
    // the viewport, the second row (top 655 → -45) is partly in it
    const scrolled = desktop.items.map(({ rect: r, list }) => ({
      rect: rect(r.left, r.top - 700, r.right, r.bottom - 700),
      list,
    }));
    assert.equal(pickStart(scrolled, viewport), desktop.at(3));
  });

  test('falls back to the first candidate when none is in view, and -1 when there are none', () => {
    const below = [{ rect: rect(0, 1000, 10, 1010), list: null }];
    assert.equal(pickStart(below, viewport), 0);
    assert.equal(pickStart([], viewport), -1);
  });
});
