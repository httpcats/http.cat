import BackLink from '@/components/BackLink';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PostContent from '@/components/PostContent';

import { renderAbout } from '@/lib/about';
import type { Locale } from '@/lib/site';
import { getTranslations } from '@/lib/translation';

import styles from './AboutPage.module.css';

// The about page, shared by /about and /ca/about. See specs/0007-about-page.
const AboutPage = async ({ locale }: { locale: Locale }) => {
  const t = await getTranslations(locale);
  const aboutHTML = await renderAbout(locale);

  return (
    <>
      <Header t={t} />
      <main>
        <BackLink href={locale === 'ca' ? '/ca' : '/'}>{t.BACK_TO_HOME}</BackLink>

        <section className="flex justify-center tracking-wider my-12">
          <PostContent>
            <h1>{t.ABOUT_TITLE}</h1>
            <div className={styles.content} dangerouslySetInnerHTML={{ __html: aboutHTML }} />
          </PostContent>
        </section>
      </main>
      <Footer t={t} />
    </>
  );
};

export default AboutPage;
