'use client';

import { useSearchParams } from 'next/navigation';
import ReceivedMessagesPage from '@/components/messages/ReceivedMessagesPage';
import MessageDetailPage from '@/components/messages/MessageDetailPage';

export default function LocaleReceivedMessagesPage() {
  const searchParams = useSearchParams();
  const messageId = searchParams?.get('id');

  // If there's a message ID in query params, show the detail page
  if (messageId) {
    return <MessageDetailPage />;
  }

  // Otherwise show the list
  return <ReceivedMessagesPage />;
}

