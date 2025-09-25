import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'fr'] as const;
export type Locale = typeof locales[number];

export default getRequestConfig(async ({ locale }) => {
  const validLocale = locale && locales.includes(locale as Locale) ? locale : 'en';

  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}.json`)).default
  };
});
