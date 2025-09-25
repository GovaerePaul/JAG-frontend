import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n/request';
import { isValidLocale } from '@/i18n/utils';
import { generateMetadata as generateI18nMetadata } from '@/i18n/metadata';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ 
  params: { locale } 
}: { 
  params: { locale: string } 
}) {
  if (!isValidLocale(locale)) {
    return {};
  }
  
  return generateI18nMetadata(locale);
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: LocaleLayoutProps) {
  if (!isValidLocale(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
