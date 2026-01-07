'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSentMessages, MessageSummary } from '@/lib/messages-api';
import { useAuth } from './useAuth';

interface UseSentMessagesReturn {
  messages: MessageSummary[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Global cache to share sent messages across components
export const sentMessagesCache = {
  data: null as MessageSummary[] | null,
  timestamp: 0,
  promise: null as Promise<void> | null,
};

export function invalidateSentMessagesCache() {
  sentMessagesCache.data = null;
  sentMessagesCache.timestamp = 0;
}

const CACHE_DURATION = 30000; // 30 seconds

export function useSentMessages(): UseSentMessagesReturn {
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
    if (sentMessagesCache.data && (now - sentMessagesCache.timestamp) < CACHE_DURATION) {
      setMessages(sentMessagesCache.data);
      setLoading(false);
      return;
    }

    // If already fetching, wait for that promise
    if (sentMessagesCache.promise) {
      await sentMessagesCache.promise;
      if (sentMessagesCache.data) {
        setMessages(sentMessagesCache.data);
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const fetchPromise = (async () => {
      try {
        const response = await getSentMessages();
        if (response.success && response.data) {
          sentMessagesCache.data = response.data;
          sentMessagesCache.timestamp = Date.now();
          setMessages(response.data);
        } else {
          setError(response.error || 'Failed to fetch messages');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch messages';
        setError(errorMessage);
      } finally {
        setLoading(false);
        sentMessagesCache.promise = null;
      }
    })();

    sentMessagesCache.promise = fetchPromise;
    await fetchPromise;
  }, [user]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const refetch = useCallback(async () => {
    invalidateSentMessagesCache();
    await fetchMessages();
  }, [fetchMessages]);

  return { messages, loading, error, refetch };
}

