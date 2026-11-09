'use client';

import { useEffect } from 'react';

import { isShortcutAllowed } from '@/lib/shortcuts';
import { Direction, Item, pickNext, pickStart } from '@/lib/spatial-nav';

// Vim-style keyboard navigation: h/j/k/l move focus to the nearest link or
// button left, down, up or right, and Enter opens it (the browser's own
// behavior for a focused link); gg and G go to the top and the bottom of the
// page. Rendered once by SiteLayout, so it covers every page. See
// specs/0006-keyboard-navigation.

const KEYS: Record<string, Direction> = { h: 'left', j: 'down', k: 'up', l: 'right' };

const LIST = '[data-keynav-list]';

// how long after a first `g` a second one makes `gg` (vim's default timeoutlen)
const SEQUENCE_TIMEOUT = 1000;

// Shift for `G`, and the other modifiers, don't interrupt a `gg`
const MODIFIERS = ['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'];

// what Tab reaches, minus the third-party ad: inside the open modal dialog
// (the settings) if there is one, since the page behind it is inert
const getCandidates = () =>
  Array.from(
    (document.querySelector('dialog:modal') ?? document).querySelectorAll<HTMLElement>(
      'a[href], button',
    ),
  ).filter((el) => {
    if (el.closest('#carbon-container')) return false;
    if (el instanceof HTMLButtonElement && el.disabled) return false;
    if (el.tabIndex < 0) return false;
    const { width, height } = el.getBoundingClientRect();
    return width > 0 && height > 0 && getComputedStyle(el).visibility !== 'hidden';
  });

// gg and G: scroll to the top or the bottom. If the highlight is on, it moves
// to the first or the last candidate, like vim's cursor, so h/j/k/l carry on
// from there; if nothing is highlighted, they only scroll.
const goToEnd = (end: 'top' | 'bottom') => {
  const elements = getCandidates();
  if (elements.includes(document.activeElement as HTMLElement) && elements.length > 0) {
    elements[end === 'top' ? 0 : elements.length - 1].focus({ preventScroll: true });
  }
  window.scrollTo({ top: end === 'top' ? 0 : document.documentElement.scrollHeight });
};

const KeyboardNav = () => {
  useEffect(() => {
    // when the first `g` of a possible `gg` was pressed, or 0
    let pendingG = 0;

    const onKeyDown = (event: KeyboardEvent) => {
      if (MODIFIERS.includes(event.key)) return;
      const isFirstG = event.key === 'g' && Date.now() - pendingG > SEQUENCE_TIMEOUT;
      const isSecondG = event.key === 'g' && !isFirstG;
      pendingG = 0;

      if (event.key === 'g' || event.key === 'G') {
        // not behind the settings window or the command line
        if (!isShortcutAllowed(event) || document.querySelector('dialog:modal')) return;
        event.preventDefault();
        if (isFirstG) pendingG = Date.now();
        else goToEnd(isSecondG ? 'top' : 'bottom');
        return;
      }

      const direction = KEYS[event.key];
      if (!direction || !isShortcutAllowed(event)) return;

      // even when nothing moves, so the key can't start find-as-you-type
      event.preventDefault();

      const elements = getCandidates();
      const lists = Array.from(document.querySelectorAll(LIST));
      const items: Item[] = elements.map((el) => {
        const list = el.closest(LIST);
        return { rect: el.getBoundingClientRect(), list: list ? lists.indexOf(list) : null };
      });

      const current = elements.indexOf(document.activeElement as HTMLElement);
      const next =
        current === -1
          ? pickStart(items, { width: window.innerWidth, height: window.innerHeight })
          : pickNext(direction, items[current], items);
      if (next === -1) return;

      const target = elements[next];
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return null;
};

export default KeyboardNav;
