import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  distDir: 'out',
  // Improve CSS optimization for emotion/MUI
  compiler: {
    emotion: true,
  },
  // Optimize for static export with SSG
  reactStrictMode: true,
  // Disable ESLint during builds
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  // // Disable TypeScript checks during builds
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  // Turbopack configuration (replaces webpack config)
  turbopack: {
    root: __dirname, // Use current directory dynamically
    // Turbopack-specific configuration if needed
    resolveAlias: {
      // Add any alias configurations here if needed
    }
  }
};

export default withNextIntl(nextConfig);
