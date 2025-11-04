'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import FacebookButton from '@/components/FacebookButton';
import GithubButton from '@/components/GithubButton';
import BlueskyButton from '@/components/BlueskyButton';
import MastodonButton from '@/components/MastodonButton';
import TwitterButton from '@/components/TwitterButton';

import styles from './Footer.module.css';

type FooterProps = {
  t: { [key: string]: string };
};

const Footer = ({ t }: FooterProps) => {
  const pathname = usePathname();

  const localeHref = t.LOCALE === 'ca' ? '/' : '/ca';

  return (
    <div className={styles.container}>
      <div className={styles.social}>
        <TwitterButton width={70} height={70} />
        <BlueskyButton width={70} height={70} />
        <MastodonButton width={70} height={70} />
        <FacebookButton width={70} height={70} />
        <GithubButton width={70} height={70} />
      </div>

      <nav>
        <Link href={localeHref}>{t.LANGUAGE_LINK_TEXT}</Link>
      </nav>

      <p>
        {t.DEVELOPED_BY}{' '}
        <a href="https://twitter.com/rogeriopvl">@rogeriopvl</a>
      </p>
      <p>
        {t.IMAGES_BY} Tomomi Imura (
        <a href="https://twitter.com/girlie_mac">@girlie_mac</a>)
      </p>
    </div>
  );
};

export default Footer;
