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

  // Fetch messages only once when component first mounts
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps = only on mount

  // No automatic polling - users refresh manually
  // Real-time updates can be added later with WebSockets or similar

  return {
    unreadCount,
    loading,
    error,
    refetch,
  };
}

