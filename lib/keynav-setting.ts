// Keyboard navigation's on/off switch, set from the footer
// (specs/0006-keyboard-navigation). Saved in localStorage as `keynav=off`
// while it's off. When localStorage can't be written (e.g. blocked), the
// choice is kept in memory until the page is reloaded.

const KEY = 'keynav';
const EVENT = 'keynav-change';

let inMemory: boolean | null = null;

export function isKeynavEnabled(): boolean {
  if (inMemory !== null) return inMemory;
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setKeynavEnabled(on: boolean): void {
  try {
    if (on) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, 'off');
    inMemory = null;
  } catch {
    inMemory = on;
  }
  window.dispatchEvent(new Event(EVENT));
}

// for useSyncExternalStore: changes from this tab, and from other tabs
export function subscribeKeynav(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}
