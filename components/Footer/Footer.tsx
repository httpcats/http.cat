import Link from 'next/link';
import FacebookButton from '@/components/FacebookButton';
import GithubButton from '@/components/GithubButton';
import TwitterButton from '@/components/TwitterButton';
import styles from './Footer.module.css';

import lang from '@/locales/en/common.json';

const Footer = () => {
  return (
    <div className={styles.container}>
      <div className={styles.social}>
        <FacebookButton />
        <GithubButton />
        <TwitterButton />
      </div>

      {/* <nav>
        <Link href="/" locale="ca">
          {lang.LANGUAGE_LINK_TEXT}
        </Link>
      </nav> */}

      <p>
        {lang.DEVELOPED_BY}{' '}
        <a href="https://twitter.com/rogeriopvl">@rogeriopvl</a>
      </p>
      <p>
        {lang.IMAGES_BY} Tomomi Imura (
        <a href="https://twitter.com/girlie_mac">@girlie_mac</a>)
      </p>

      <p>
        Check out <a href="https://www.abstractapi.com">Abstract API</a>, the
        home for modern, developer-friendly tools like the{' '}
        <a href="https://www.abstractapi.com/ip-geolocation-api">
          IP Geolocation API
        </a>
        ,{' '}
        <a href="https://www.abstractapi.com/vat-validation-rates-api">
          VAT Validation & Rates API
        </a>
        ,{' '}
        <a href="https://www.abstractapi.com/holidays-api">
          Public Holiday API
        </a>
        , and more.
      </p>
    </div>
  );
};

export default Footer;
