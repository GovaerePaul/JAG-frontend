import { locales, type Locale } from './request';

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
