'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import FacebookButton from '@/components/FacebookButton';
import GithubButton from '@/components/GithubButton';
import BlueskyButton from '@/components/BlueskyButton';
import MastodonButton from '@/components/MastodonButton';
import Settings from '@/components/Settings';
import TwitterButton from '@/components/TwitterButton';
import { aboutPath } from '@/lib/site';

import styles from './Footer.module.css';

type FooterProps = {
  t: { [key: string]: string };
};

const Footer = ({ t }: FooterProps) => {
  const pathname = usePathname();

  const localeHref = t.LOCALE === 'ca' ? '/' : '/ca';
  const aboutHref = aboutPath(t.LOCALE === 'ca' ? 'ca' : 'en');

  return (
    // a <footer> outside <main> is the page's contentinfo landmark, so screen
    // reader users can jump to it (idea from PR #144 by @Timmaaaa)
    <footer className={styles.container}>
      <div className={styles.social}>
        <TwitterButton width={70} height={70} />
        <BlueskyButton width={70} height={70} />
        <MastodonButton width={70} height={70} />
        <FacebookButton width={70} height={70} />
        <GithubButton width={70} height={70} />
      </div>

      <nav>
        <Link href={localeHref}>{t.LANGUAGE_LINK_TEXT}</Link>
        {' · '}
        {/* the about page is in both languages (spec 0007) */}
        <Link href={aboutHref}>{t.ABOUT_LINK_TEXT}</Link>
        {' · '}
        {/* the blog is English only, so both languages link to /blog, and
            hreflang says so (spec 0004) */}
        <Link href="/blog" hrefLang="en">
          {t.BLOG_LINK_TEXT}
        </Link>
        {' · '}
        <Settings t={t} />
      </nav>

      <p>
        {t.DEVELOPED_BY}{' '}
        <a href="https://twitter.com/rogeriopvl">@rogeriopvl</a>
      </p>
      <p>
        {t.IMAGES_BY} Tomomi Imura (
        <a href="https://twitter.com/girlie_mac">@girlie_mac</a>)
      </p>
    </footer>
  );
};

export default Footer;
