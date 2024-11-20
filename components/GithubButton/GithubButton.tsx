import Image from 'next/image';

import githubIcon from './github.svg';

type GithubButtonProps = {
  width?: number;
  height?: number;
};

const GithubButton = ({ width = 50, height = 50 }: GithubButtonProps) => (
  <div>
    <a
      href="https://github.com/httpcats/http.cat"
      target="_blank"
      rel="me noopener noreferrer"
      title="http.cat github repository"
    >
      <Image src={githubIcon} alt="Github logo" width={width} height={height} />
    </a>
  </div>
);

export default GithubButton;
