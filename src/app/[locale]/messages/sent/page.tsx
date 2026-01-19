'use client';

import { useSearchParams } from 'next/navigation';
import SentMessagesPage from '@/components/messages/SentMessagesPage';
import MessageDetailPage from '@/components/messages/MessageDetailPage';

export default function LocaleSentMessagesPage() {
  const searchParams = useSearchParams();
  const messageId = searchParams?.get('id');

  if (messageId) {
    return <MessageDetailPage />;
  }

  return <SentMessagesPage />;
}

