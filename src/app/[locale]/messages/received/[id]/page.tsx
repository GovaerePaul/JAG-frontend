import MessageDetailPage from '@/components/messages/MessageDetailPage';
import { locales } from '@/i18n/request';

export async function generateStaticParams() {
  // With output: export, we need to return at least one param combination per locale
  // Return locale combinations with a placeholder id - actual message IDs will be handled client-side
  // Note: This creates placeholder routes that won't be used, but satisfies Next.js requirement
  return locales.map((locale) => ({
    locale,
    id: 'placeholder', // Placeholder id - actual routes will be handled client-side via routing
  }));
}

export default function LocaleMessageDetailPage() {
  return <MessageDetailPage />;
}

