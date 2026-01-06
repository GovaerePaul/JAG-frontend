'use client';

import { useState, useEffect, useCallback } from 'react';
import { getReceivedMessages, MessageSummary } from '@/lib/messages-api';

interface UseUnreadMessagesReturn {
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and count unread messages
 * Unread messages are those with status !== 'read'
 */
export function useUnreadMessages(): UseUnreadMessagesReturn {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getReceivedMessages();
      if (response.success && response.data) {
        const unread = response.data.filter(
          (msg: MessageSummary) => msg.status !== 'read'
        ).length;
        setUnreadCount(unread);
      } else {
        setError(response.error || 'Failed to fetch messages');
      }
    } catch (err) {
      setError('Failed to fetch messages');
      console.error('Error fetching unread messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    // Poll for new messages every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return {
    unreadCount,
    loading,
    error,
    refetch: fetchUnreadCount,
  };
}

