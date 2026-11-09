// The checks every vim-style key goes through, h/j/k/l and the `:` command
// line alike: see "Which keys are taken" in specs/0006-keyboard-navigation.
// The caller checks the key itself (event.key).

import { isKeynavEnabled } from '@/lib/keynav-setting';

const isTextField = (el: Element | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

export function isShortcutAllowed(event: KeyboardEvent): boolean {
  // Shift is allowed: it's how `:` is typed on most layouts, and `hjkl` only
  // match their lowercase keys anyway
  if (event.ctrlKey || event.altKey || event.metaKey) return false;
  if (event.isComposing || event.defaultPrevented) return false;
  if (isTextField(document.activeElement)) return false;
  return isKeynavEnabled();
}
