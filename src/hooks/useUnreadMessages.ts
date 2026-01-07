'use client';

import { useState, useEffect, useMemo } from 'react';
import { useReceivedMessages } from './useReceivedMessages';

interface UseUnreadMessagesReturn {
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to count unread messages
 * Uses shared cache from useReceivedMessages to avoid duplicate API calls
 * Unread messages are those with status !== 'read'
 */
export function useUnreadMessages(): UseUnreadMessagesReturn {
  const { messages, loading, error, refetch } = useReceivedMessages();

  // Calculate unread count from cached messages
  const unreadCount = useMemo(() => {
    return messages.filter((msg) => msg.status !== 'read').length;
  }, [messages]);

  // Poll for new messages every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  return {
    unreadCount,
    loading,
    error,
    refetch,
  };
}

