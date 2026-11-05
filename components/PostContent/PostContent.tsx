import styles from './PostContent.module.css';

// min-w-0: the article is a flex item, which by default can't be narrower
// than its content, so a long line in a code block would widen the whole post
// past the screen on phones instead of scrolling inside the <pre>.
const PostContent = ({ children }: { children: React.ReactNode }) => (
  <article className={styles.container + ' max-w-3xl min-w-0'}>{children}</article>
);

export default PostContent;
