'use client';

import { useState, useEffect, useCallback } from 'react';
import { getReceivedMessages, MessageSummary } from '@/lib/messages-api';
import { useAuth } from './useAuth';

interface UseReceivedMessagesReturn {
  messages: MessageSummary[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Global cache to share received messages across components
export const receivedMessagesCache = {
  data: null as MessageSummary[] | null,
  timestamp: 0,
  promise: null as Promise<void> | null,
};

export function invalidateReceivedMessagesCache() {
  receivedMessagesCache.data = null;
  receivedMessagesCache.timestamp = 0;
}

const CACHE_DURATION = 30000; // 30 seconds

export function useReceivedMessages(): UseReceivedMessagesReturn {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    // Check cache first
    const now = Date.now();
    if (receivedMessagesCache.data && (now - receivedMessagesCache.timestamp) < CACHE_DURATION) {
      setMessages(receivedMessagesCache.data);
      setLoading(false);
      return;
    }

    // If already fetching, wait for that promise
    if (receivedMessagesCache.promise) {
      await receivedMessagesCache.promise;
      if (receivedMessagesCache.data) {
        setMessages(receivedMessagesCache.data);
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const fetchPromise = (async () => {
      try {
        const response = await getReceivedMessages();
        if (response.success && response.data) {
          receivedMessagesCache.data = response.data;
          receivedMessagesCache.timestamp = Date.now();
          setMessages(response.data);
        } else {
          setError(response.error || 'Failed to fetch messages');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch messages';
        setError(errorMessage);
      } finally {
        setLoading(false);
        receivedMessagesCache.promise = null;
      }
    })();

    receivedMessagesCache.promise = fetchPromise;
    await fetchPromise;
  }, [user]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const refetch = useCallback(async () => {
    invalidateReceivedMessagesCache();
    await fetchMessages();
  }, [fetchMessages]);

  return { messages, loading, error, refetch };
}

