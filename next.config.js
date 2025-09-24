/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Disable ESLint during build
  // TODO: ACTIVATE ESLINT
  eslint: {
    ignoreDuringBuilds: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/JAG-frontend' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/JAG-frontend/' : '',
}

module.exports = nextConfig
