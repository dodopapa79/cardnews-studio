/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
  // GitHub Pages 하위 경로 배포 시 아래 주석 해제 후 레포명 입력
  basePath: '/cardnews-studio',
  assetPrefix: '/cardnews-studio/',
};

module.exports = nextConfig;