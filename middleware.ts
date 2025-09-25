import createMiddleware from 'next-intl/middleware';
import { locales } from './src/i18n/config';

export default createMiddleware({
  // A list of all locales that are supported
  locales: locales,

  // Used when no locale matches
  defaultLocale: 'fr',

  // If this locale is matched: `/(en|fr)/:path*` (no redirect)
  localePrefix: 'always'
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(fr|en)/:path*']
};
