import Link from 'next/link';

import styles from './BackLink.module.css';

// The "Back to home" / "Back to blog" link at the top of the status, blog and
// not-found pages: a red outline pill with an arrow, filled on hover and on
// keyboard focus.

type BackLinkProps = {
  href: string;
  children: React.ReactNode;
  scroll?: boolean;
};

const BackLink = ({ href, children, scroll }: BackLinkProps) => (
  <nav className={styles.nav}>
    <Link href={href} scroll={scroll} className={styles.link}>
      <svg
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      {children}
    </Link>
  </nav>
);

export default BackLink;
