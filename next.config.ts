import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: false,
  images: { unoptimized: true },
  // app/global-not-found.tsx: the site has two root layouts (specs/0005-sitemap)
  experimental: { globalNotFound: true },
};

export default nextConfig;
