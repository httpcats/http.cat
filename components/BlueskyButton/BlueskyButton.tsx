import Image from 'next/image';

import blueskyIcon from './bluesky.svg';

type BlueskyButtonProps = {
  width?: number;
  height?: number;
};

const BlueskyButton = ({ width = 50, height = 50 }: BlueskyButtonProps) => (
  <div>
    <a
      href="https://bsky.app/profile/http.cat"
      target="_blank"
      rel="me noopener noreferrer"
      title="http.cat dev Bluesky"
    >
      <Image
        src={blueskyIcon}
        alt="Bluesky logo"
        width={width}
        height={height}
      />
    </a>
  </div>
);

export default BlueskyButton;
