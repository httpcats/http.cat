import Image from 'next/image';

import twitterIcon from './twitter.svg';

type TwitterButtonProps = {
  width?: number;
  height?: number;
};

const TwitterButton = ({ width = 50, height = 50 }: TwitterButtonProps) => (
  <div>
    <a
      href="https://twitter.com/rogeriopvl"
      target="_blank"
      rel="me noopener noreferrer"
      title="http.cat dev twitter"
    >
      <Image
        src={twitterIcon}
        alt="Twitter logo"
        width={width}
        height={height}
      />
    </a>
  </div>
);

export default TwitterButton;
