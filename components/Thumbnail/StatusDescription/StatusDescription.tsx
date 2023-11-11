import Link from 'next/link';

import styles from './StatusDescription.module.css';

const StatusDescription = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.container + ' max-w-3xl'}>
    {children}
  </div>
);

export default StatusDescription;
