import Image from 'next/image';

import mastodonIcon from './mastodon.svg';

type MastodonButtonProps = {
  width?: number;
  height?: number;
};

const MastodonButton = ({ width = 50, height = 50 }: MastodonButtonProps) => (
  <div>
    <a
      href="https://mastodon.social/@rogeriopvl"
      target="_blank"
      rel="me noopener noreferrer"
      title="http.cat dev Mastodon"
    >
      <Image
        src={mastodonIcon}
        alt="Mastodon logo"
        width={width}
        height={height}
      />
    </a>
  </div>
);

export default MastodonButton;
