'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { Entry, Status, matchCommands } from '@/lib/commands';
import { isKeynavEnabled, setKeynavEnabled, subscribeKeynav } from '@/lib/keynav-setting';
import { isShortcutAllowed } from '@/lib/shortcuts';
import statuses from '@/lib/statuses';
import { pathInLanguage } from '@/lib/site';
import { isDarkTheme, setDarkTheme, subscribeTheme } from '@/lib/theme-setting';
import { useBackdropClose } from '@/lib/use-backdrop-close';

import styles from './CommandLine.module.css';

// The vim-style command line: `:` opens a floating box (a native modal
// <dialog>, like the settings window) with a text field and the matching
// commands. Rendered once by SiteLayout. See "Command line" in
// specs/0006-keyboard-navigation.

const STATUSES: Status[] = Object.values(statuses);

// a stable key, also used for the row's id
const keyOf = (entry: Entry) =>
  entry.kind === 'hint' ? entry.command : `${entry.command}-${entry.value}`;

type CommandLineProps = {
  t: { [key: string]: string };
};

const CommandLine = ({ t }: CommandLineProps) => {
  const dialog = useRef<HTMLDialogElement>(null);
  const [text, setText] = useState('');
  const [selected, setSelected] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const backdropClose = useBackdropClose(dialog);
  // status pages are in the page's language: /status/<code> or /ca/status/<code>
  const statusPath = (code: number) => `${t.LOCALE === 'ca' ? '/ca' : ''}/status/${code}`;

  const dark = useSyncExternalStore(subscribeTheme, isDarkTheme, () => false);
  const keynav = useSyncExternalStore(subscribeKeynav, isKeynavEnabled, () => true);
  const isCurrent = (entry: Entry) => {
    if (entry.kind === 'hint') return false;
    switch (entry.command) {
      case 'status':
        return pathname === statusPath(Number(entry.value));
      case 'blog':
        return pathname === '/blog';
      case 'lang':
        return (entry.value === 'cat') === (t.LOCALE === 'ca');
      case 'theme':
        return (entry.value === 'dark') === dark;
      case 'vim':
        return (entry.value === 'on') === keynav;
    }
  };

  const { entries, error } = matchCommands(text, STATUSES);
  const active = Math.min(selected, entries.length - 1);
  const activeId = entries.length > 0 ? `command-${keyOf(entries[active])}` : undefined;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== ':' || !isShortcutAllowed(event)) return;
      // not over the settings window (or another modal)
      if (document.querySelector('dialog:modal')) return;
      // also keeps the `:` from being typed into the field
      event.preventDefault();
      setText('');
      setSelected(0);
      // focuses the field, the dialog's only focusable element
      dialog.current?.showModal();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // keep the selected row visible when the list scrolls (`status 4` is long)
  useEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView({ block: 'nearest' });
  }, [activeId]);

  const complete = (entry: Entry) => {
    setText(entry.kind === 'hint' ? `${entry.command} ` : entry.name);
    setSelected(0);
  };

  const run = (entry: Entry) => {
    if (entry.kind === 'hint') {
      // the command needs its argument first
      complete(entry);
      return;
    }
    dialog.current?.close();
    switch (entry.command) {
      case 'status':
        return router.push(statusPath(Number(entry.value)));
      case 'blog':
        // English only, like the footer's blog link
        return router.push('/blog');
      case 'lang':
        return router.push(pathInLanguage(pathname, entry.value === 'cat' ? 'ca' : 'en'));
      case 'theme':
        return setDarkTheme(entry.value === 'dark');
      case 'vim':
        return setKeynavEnabled(entry.value === 'on');
    }
  };

  const move = (by: number) => {
    if (entries.length > 0) setSelected((active + by + entries.length) % entries.length);
  };

  const onFieldKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const ctrl = event.ctrlKey && !event.altKey && !event.metaKey;
    if (event.key === 'ArrowDown' || (ctrl && event.key === 'n')) {
      event.preventDefault();
      move(1);
    } else if (event.key === 'ArrowUp' || (ctrl && event.key === 'p')) {
      event.preventDefault();
      move(-1);
    } else if (event.key === 'Tab' && !event.shiftKey) {
      // complete to the selected command, and stay in the field
      event.preventDefault();
      if (entries.length > 0) complete(entries[active]);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (entries.length > 0) run(entries[active]);
    }
  };

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-label={t.COMMAND_LABEL}
      {...backdropClose}
    >
      <div className={styles.box}>
        <div className={styles.field}>
          <span className={styles.prompt} aria-hidden="true">
            :
          </span>
          <input
            type="text"
            className={styles.input}
            role="combobox"
            aria-label={t.COMMAND_LABEL}
            aria-expanded={entries.length > 0}
            aria-controls="command-list"
            aria-autocomplete="list"
            aria-activedescendant={activeId}
            placeholder={t.COMMAND_PLACEHOLDER}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setSelected(0);
            }}
            onKeyDown={onFieldKeyDown}
          />
        </div>

        <ul id="command-list" role="listbox" className={styles.list} hidden={entries.length === 0}>
          {entries.map((entry, index) => (
            <li
              key={keyOf(entry)}
              id={`command-${keyOf(entry)}`}
              role="option"
              aria-selected={index === active}
              className={styles.option}
              onMouseMove={() => setSelected(index)}
              onClick={() => run(entry)}
            >
              <span className={styles.name}>
                {entry.kind === 'hint' ? (
                  <>
                    {entry.command} <span className={styles.argument}>{entry.usage}</span>
                  </>
                ) : (
                  entry.name
                )}
              </span>
              <span className={styles.description}>
                {/* a status's name, or a translated description */}
                {entry.kind === 'option' && entry.description
                  ? entry.description
                  : t[entry.descriptionKey ?? '']}
              </span>
              {isCurrent(entry) && <span className={styles.current}>{t.COMMAND_CURRENT}</span>}
            </li>
          ))}
        </ul>

        {/* always in the page, so screen readers announce the error when it appears */}
        <p className={styles.error} aria-live="polite">
          {error ? `${t[error.key]}: ${error.text}` : ''}
        </p>
      </div>
    </dialog>
  );
};

export default CommandLine;
