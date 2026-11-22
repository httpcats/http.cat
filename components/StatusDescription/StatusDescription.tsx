import PostContent from '@/components/PostContent';

import styles from './StatusDescription.module.css';

// A status page's description: prose, with the same typography as the blog
// and the about page (PostContent), plus its own source line and boxes.
const StatusDescription = ({ children }: { children: React.ReactNode }) => (
  <PostContent>
    <div className={styles.container}>{children}</div>
  </PostContent>
);

export default StatusDescription;
