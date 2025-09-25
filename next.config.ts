import type { NextConfig } from "next";

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
  // Turbopack configuration (replaces webpack config)
  turbopack: {
    // Turbopack-specific configuration if needed
    resolveAlias: {
      // Add any alias configurations here if needed
    }
  }
};

export default nextConfig;
