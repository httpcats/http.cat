'use client';

import { useRef, useSyncExternalStore } from 'react';

import { isKeynavEnabled, setKeynavEnabled, subscribeKeynav } from '@/lib/keynav-setting';
import { isDarkTheme, setDarkTheme, subscribeTheme } from '@/lib/theme-setting';
import { useBackdropClose } from '@/lib/use-backdrop-close';

import styles from './Settings.module.css';

// The footer's Settings link and the settings window it opens, with switches
// for keyboard navigation and the dark theme. A native modal <dialog> keeps
// focus inside, makes the page inert, closes on Esc and gives focus back to
// the link. See specs/0006-keyboard-navigation.

type SwitchProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const Switch = ({ label, checked, onChange }: SwitchProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    className={styles.switch}
    onClick={() => onChange(!checked)}
  >
    <span>{label}</span>
    <span className={styles.track} aria-hidden="true" />
  </button>
);

type SettingsProps = {
  t: { [key: string]: string };
};

const Settings = ({ t }: SettingsProps) => {
  const dialog = useRef<HTMLDialogElement>(null);
  // the static HTML has the defaults (the server snapshots); the dialog is
  // closed then, so nobody sees them before they're corrected
  const keynav = useSyncExternalStore(subscribeKeynav, isKeynavEnabled, () => true);
  const dark = useSyncExternalStore(subscribeTheme, isDarkTheme, () => false);

  const backdropClose = useBackdropClose(dialog);

  const close = () => dialog.current?.close();

  return (
    <>
      <button type="button" className={styles.link} onClick={() => dialog.current?.showModal()}>
        {t.SETTINGS_LINK_TEXT}
      </button>

      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby="settings-title"
        {...backdropClose}
      >
        <div className={styles.content}>
          <h2 id="settings-title">{t.SETTINGS_TITLE}</h2>
          <Switch label={t.SETTINGS_KEYNAV_LABEL} checked={keynav} onChange={setKeynavEnabled} />
          <Switch label={t.SETTINGS_DARK_THEME_LABEL} checked={dark} onChange={setDarkTheme} />
          <div className={styles.actions}>
            <button type="button" className={styles.close} onClick={close}>
              {t.SETTINGS_CLOSE}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default Settings;
