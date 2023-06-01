import { type } from 'os';
import styles from './ThumbnailGrid.module.css';

type ThumbnailGridProps = {
  children: React.ReactNode[];
};

const ThumbnailGrid = ({ children }: ThumbnailGridProps) => {
  return (
    <ul className={styles.container}>
      {children.map((el, idx) => (
        <li className={styles.thumbnail} key={idx}>
          {el}
        </li>
      ))}
    </ul>
  );
};

export default ThumbnailGrid;
