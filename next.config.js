/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // GitHub Pages utilise un sous-chemin si le repo n'est pas nomme username.github.io
  basePath: process.env.NODE_ENV === 'production' ? '/JustAGift' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/JustAGift/' : '',
}

module.exports = nextConfig
