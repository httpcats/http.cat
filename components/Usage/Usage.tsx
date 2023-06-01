'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import useCopyToClipboard from '@/hooks/useCopyToClipboard';
import copyIcon from './copy.svg';
import styles from './Usage.module.css';

import lang from '@/locales/en/common.json';

const Usage = () => {
  const [isValueCopied, setIsValueCopied] = useState(false);
  const [value, copy] = useCopyToClipboard();

  const usageValue = `https://http.cat/[${lang.USAGE_PARAM}]`;

  useEffect(() => {
    if (isValueCopied) {
      setTimeout(() => {
        setIsValueCopied(false);
      }, 3000);
    }
  }, [isValueCopied]);

  return (
    <div className={styles.container}>
      <h2>{lang.USAGE_TITLE}:</h2>
      <pre>
        {usageValue}
        <button
          onClick={() => {
            copy(usageValue);
            setIsValueCopied(true);
          }}
          title="Copy to clipboard"
        >
          {isValueCopied ? (
            lang.COPIED
          ) : (
            <Image src={copyIcon} alt={lang.COPY_ICON_ALT_TEXT} />
          )}
        </button>
      </pre>
      <p>
        <b>{lang.USAGE_NOTE_LABEL}:</b> {lang.USAGE_NOTE_TEXT} <code>.jpg</code>
        .
      </p>
    </div>
  );
};

export default Usage;
