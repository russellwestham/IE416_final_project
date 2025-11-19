/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router 사용
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
