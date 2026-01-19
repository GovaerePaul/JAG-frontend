'use client';

import { useAppSelector } from '@/store/hooks';
import {
  selectUnreadCount,
  selectReceivedMessagesLoading,
  selectMessagesError,
} from './messagesSelectors';
import { useReceivedMessages } from './useReceivedMessages';

interface UseUnreadMessagesReturn {
  unreadCount: number;
  messages: ReturnType<typeof useReceivedMessages>['messages'];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUnreadMessages(): UseUnreadMessagesReturn {
  const unreadCount = useAppSelector(selectUnreadCount);
  const loading = useAppSelector(selectReceivedMessagesLoading);
  const error = useAppSelector(selectMessagesError);
  const { refetch } = useReceivedMessages();
  const messages = useAppSelector((state) => state.messages.receivedMessages);

  return {
    unreadCount,
    messages,
    loading,
    error,
    refetch,
  };
}
