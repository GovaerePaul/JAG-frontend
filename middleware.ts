import createMiddleware from 'next-intl/middleware';
import { locales } from './src/i18n/request';

export default createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always',
  localeDetection: true
});

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/(en|fr)/:path*'
  ]
};
