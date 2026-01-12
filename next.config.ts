import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Disable basePath for Capacitor mobile builds
const isCapacitorBuild = process.env.CAPACITOR_BUILD === "true";
const basePath = isCapacitorBuild ? "" : (process.env.NODE_ENV === "production" ? "/JAG-frontend" : "");

const nextConfig: NextConfig = {
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  trailingSlash: true,
  basePath,
  images: {
    unoptimized: true,
  },
  distDir: "out",
  compiler: {
    emotion: true,
  },
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default withNextIntl(nextConfig);
