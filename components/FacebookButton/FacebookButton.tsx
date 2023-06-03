import Image from 'next/image';

import facebookIcon from './facebook.svg';
import styles from './FacebookButton.module.css';

type FacebookButtonProps = {
  width?: number;
  height?: number;
};

const FacebookButton = ({ width = 50, height = 50 }: FacebookButtonProps) => (
  <div className={styles.container}>
    <a
      href="https://www.facebook.com/httpcats"
      target="_blank"
      rel="noopener noreferrer"
      title="http.cat facebook page"
    >
      <Image
        src={facebookIcon}
        alt="Facebook logo"
        width={width}
        height={height}
      />
    </a>
  </div>
);

export default FacebookButton;
