import Image from 'next/image';

import githubIcon from './github.svg';
import styles from './GithubButton.module.css';

type GithubButtonProps = {
  width: number;
  height: number;
};

const GithubButton = ({ width, height }: GithubButtonProps) => (
  <div className={styles.container}>
    <a
      href="https://github.com/httpcats/http.cat"
      target="_blank"
      rel="noopener noreferrer"
      title="http.cat github repository"
    >
      <Image src={githubIcon} alt="Github logo" width={width} height={height} />
    </a>
  </div>
);

GithubButton.defaultProps = {
  width: 50,
  height: 50,
};

export default GithubButton;
