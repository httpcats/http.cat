import SiteLayout, { siteMetadata, siteViewport } from '@/components/SiteLayout';

// Root layout of the English pages. The Catalan ones have their own in
// app/(ca)/layout.tsx, so each can set <html lang>. See specs/0005-sitemap.
export const metadata = siteMetadata;
export const viewport = siteViewport;

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <SiteLayout lang="en">{children}</SiteLayout>;
}
