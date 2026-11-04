import styles from './PostContent.module.css';

const PostContent = ({ children }: { children: React.ReactNode }) => (
  <article className={styles.container + ' max-w-3xl'}>{children}</article>
);

export default PostContent;
