// The dark theme switch in the settings (specs/0006-keyboard-navigation).
//
// The page follows the system's theme unless <html> has data-theme="dark" or
// "light": app/globals.css picks the colors with `color-scheme` and
// `light-dark()`. The choice is saved in localStorage as `theme` only while
// it differs from the system, so flipping the switch back to the system's
// theme makes the site follow the system again. When localStorage can't be
// written, data-theme still holds the choice until the page is reloaded.

const KEY = 'theme';
const EVENT = 'theme-change';
const DARK_QUERY = '(prefers-color-scheme: dark)';

// Runs at the top of <head>, before the page is painted, so a saved theme
// shows without a flash of the other one. Rendered by components/SiteLayout.
export const themeScript = `try{var t=localStorage.getItem('${KEY}');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}`;

const systemIsDark = () => window.matchMedia(DARK_QUERY).matches;

export function isDarkTheme(): boolean {
  const chosen = document.documentElement.dataset.theme;
  return chosen ? chosen === 'dark' : systemIsDark();
}

export function setDarkTheme(dark: boolean): void {
  const root = document.documentElement;
  if (dark === systemIsDark()) {
    delete root.dataset.theme;
    try {
      localStorage.removeItem(KEY);
    } catch {}
  } else {
    const theme = dark ? 'dark' : 'light';
    root.dataset.theme = theme;
    try {
      localStorage.setItem(KEY, theme);
    } catch {}
  }
  window.dispatchEvent(new Event(EVENT));
}

// for useSyncExternalStore: changes from the settings, from other tabs (which
// are applied to this one too), and of the system preference
export function subscribeTheme(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY && event.key !== null) return;
    const theme = event.newValue;
    if (theme === 'dark' || theme === 'light') document.documentElement.dataset.theme = theme;
    else delete document.documentElement.dataset.theme;
    onChange();
  };
  const system = window.matchMedia(DARK_QUERY);

  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onStorage);
  system.addEventListener('change', onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener('storage', onStorage);
    system.removeEventListener('change', onChange);
  };
}
