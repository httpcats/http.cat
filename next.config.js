/** @type {import('next').NextConfig} */
// const nextTranslate = require('next-translate-plugin');

const nextConfig = {
  output: 'export',
  experimental: { appDir: true },
  reactStrictMode: false,
  images: { unoptimized: true },
};

module.exports = nextConfig;
