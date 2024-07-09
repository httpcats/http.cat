'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import useCopyToClipboard from '@/hooks/useCopyToClipboard';
import copyIcon from './copy.svg';
import styles from './Usage.module.css';

type UsageProps = {
  t: { [key: string]: string };
};

const Usage = ({ t }: UsageProps) => {
  const [isValueCopied, setIsValueCopied] = useState(false);
  const [value, copy] = useCopyToClipboard();

  const usageValue = `https://http.cat/[${t.USAGE_PARAM}]`;

  useEffect(() => {
    if (isValueCopied) {
      setTimeout(() => {
        setIsValueCopied(false);
      }, 3000);
    }
  }, [isValueCopied]);

  return (
    <div className={styles.container}>
      <h2>{t.USAGE_TITLE}:</h2>
      <pre>
        {usageValue}
        <button
          onClick={() => {
            copy(usageValue);
            setIsValueCopied(true);
          }}
          title={t.COPY_TO_CLIPBOARD}
        >
          {isValueCopied ? (
            t.COPIED
          ) : (
            <Image src={copyIcon} alt={t.COPY_ICON_ALT_TEXT} />
          )}
        </button>
      </pre>
      <p>
        <b>{t.USAGE_NOTE_LABEL}:</b> {t.USAGE_NOTE_TEXT} <code>.jpg</code>.
      </p>
    </div>
  );
};

export default Usage;
