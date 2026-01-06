import MessageDetailPage from '@/components/messages/MessageDetailPage';
import { locales } from '@/i18n/request';

export async function generateStaticParams() {
  // With output: export, we need to return at least one param combination
  // Return locale combinations with empty id - actual message IDs will be handled client-side
  return locales.map((locale) => ({
    locale,
    id: '', // Empty id - will be handled dynamically
  }));
}

export const dynamicParams = true;

export default function LocaleSentMessageDetailPage() {
  return <MessageDetailPage />;
}

