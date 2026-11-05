import SiteLayout, { siteMetadata, siteViewport } from '@/components/SiteLayout';

// Root layout of the Catalan pages (/ca, /ca/status/<code>). The English ones
// have their own in app/(en)/layout.tsx, so each can set <html lang>. See
// specs/0005-sitemap.
export const metadata = siteMetadata;
export const viewport = siteViewport;

export default function CatalanLayout({ children }: { children: React.ReactNode }) {
  return <SiteLayout lang="ca">{children}</SiteLayout>;
}
