import { useTranslations, useLocale } from 'next-intl';
import { useRouter as useI18nRouter, usePathname } from '@/i18n/navigation';
import type { Locale } from '@/i18n/request';

export function useI18n() {
  const locale = useLocale() as Locale;
  const router = useI18nRouter();
  const pathname = usePathname();
  
  const switchLocale = (newLocale: Locale) => {
    router.push(pathname, { locale: newLocale });
  };

  return {
    locale,
    router,
    pathname,
    switchLocale,
    t: useTranslations
  };
}
