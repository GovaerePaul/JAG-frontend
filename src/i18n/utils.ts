import { locales, type Locale } from './request';

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function getDefaultLocale(): Locale {
  return 'fr';
}

export function getLocalizedPath(path: string, locale: Locale): string {
  return `/${locale}${path}`;
}

export function getLocaleFromPath(pathname: string): Locale | null {
  const locale = pathname.split('/')[1];
  return isValidLocale(locale) ? locale : null;
}
