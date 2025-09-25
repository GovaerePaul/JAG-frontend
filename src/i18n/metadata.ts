import { getTranslations } from 'next-intl/server';
import type { Locale } from './request';

export async function generateMetadata(locale: Locale) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      locale: locale,
      alternateLocale: locale === 'fr' ? 'en' : 'fr',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
