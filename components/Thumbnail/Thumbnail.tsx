import Link from 'next/link';

import styles from './Thumbnail.module.css';

type ThumbnailProps = {
  code: number;
  description: string;
};

const Thumbnail = ({ code, description }: ThumbnailProps) => (
  <div className={styles.container}>
    <Link href={`/status/${code}`}>
      <div
        className={styles.image}
        style={{ backgroundImage: `url(/images/${code}.jpg)` }}
      />
      <div className={styles.content}>
        <div className={styles.title}>{code}</div>
        <p>{description}</p>
      </div>
    </Link>
  </div>
);

export default Thumbnail;
