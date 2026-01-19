'use client';

import { useSearchParams } from 'next/navigation';
import ReceivedMessagesPage from '@/components/messages/ReceivedMessagesPage';
import MessageDetailPage from '@/components/messages/MessageDetailPage';

export default function LocaleReceivedMessagesPage() {
  const searchParams = useSearchParams();
  const messageId = searchParams?.get('id');

  if (messageId) {
    return <MessageDetailPage />;
  }

  return <ReceivedMessagesPage />;
}

