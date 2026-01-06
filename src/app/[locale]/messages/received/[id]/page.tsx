import MessageDetailPage from '@/components/messages/MessageDetailPage';

export function generateStaticParams() {
  // Return empty array - messages are dynamic and will be handled client-side
  // This satisfies Next.js requirement for output: export
  // Note: With output: export, dynamic routes won't be pre-generated
  // but the build will succeed and pages will be handled client-side
  return [];
}

export default function LocaleMessageDetailPage() {
  return <MessageDetailPage />;
}

