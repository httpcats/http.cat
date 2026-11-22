import { Literata } from 'next/font/google';

import styles from './PostContent.module.css';

// The reading font: Literata, a serif made for long texts on screens, with
// real italics (the about page's captions). Only for prose; the rest of the
// site uses the system's font. next/font downloads it at build time and
// serves it from the site itself; the latin subset covers Catalan.
//
// Kept light, because it's on the way to the first paint of every page with
// prose (it cost about 10 Lighthouse points before these settings):
// - weight: asking for 400 and 700 (rather than the full font) gets one
//   variable file per style with only a weight axis, about 40 KB for latin,
//   shared by both weights. The variable font with optical sizes is much
//   bigger. The text only uses regular and bold.
// - display: 'swap': the text shows at once in the fallback and switches to
//   Literata when it arrives. 'optional' kept the fallback whenever the font
//   took more than about 100ms, so on a phone most visitors, who land on one
//   status page and leave, never saw Literata. The fallback is resized to
//   Literata's metrics (next/font's adjustFontFallback, based on Times New
//   Roman), so the swap moves the text little, but lines still rewrap: a
//   layout shift of about 0.13 on a blog post on a throttled phone, none on
//   status pages, whose text starts below the cat.
// - variable: the font stack is set in PostContent.module.css, to end it
//   with a generic serif for systems without Times New Roman (Android, many
//   Linux setups), which would otherwise get the browser's default font,
//   maybe a sans-serif. next/font's own `fallback` option can't be used:
//   with it, the adjusted fallback above is left out of the build.
// - preload: false, because Next would preload it on every page, the home
//   page included. Without it, a browser only downloads the files a page's
//   text uses: none on the home page, italic only where there's italic text.
const literata = Literata({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-literata',
  preload: false,
});

// A page of prose: a blog post, the about page or a status description. The
// typography (width, sizes, spacing) is in PostContent.module.css.
//
// min-w-0: the article is a flex item, which by default can't be narrower
// than its content, so a long line in a code block would widen the whole post
// past the screen on phones instead of scrolling inside the <pre>.
const PostContent = ({ children }: { children: React.ReactNode }) => (
  <article className={`${styles.container} ${literata.variable} min-w-0`}>
    {children}
  </article>
);

export default PostContent;
