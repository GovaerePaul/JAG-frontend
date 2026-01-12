'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getReceivedMessages, MessageSummary } from '@/lib/messages-api';
import { useAuth } from './useAuth';

interface UseReceivedMessagesReturn {
  messages: MessageSummary[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useReceivedMessages(): UseReceivedMessagesReturn {
  const { user, isReady } = useAuth();
  const [messages, setMessages] = useState<MessageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedUidRef = useRef<string | null>(null);

  // Stabilize user identifier
  const userId = useMemo(() => user?.uid || null, [user?.uid]);

  useEffect(() => {
    // Don't make API calls until user is authenticated and ready
    if (!isReady || !userId) {
      setMessages([]);
      setLoading(false);
      lastFetchedUidRef.current = null;
      return;
    }

    // Skip if we already fetched for this user
    if (lastFetchedUidRef.current === userId) {
      return;
    }

    lastFetchedUidRef.current = userId;
    setLoading(true);
    setError(null);
    
    const fetchMessages = async () => {
      try {
        const response = await getReceivedMessages();
        if (response.success && response.data) {
          setMessages(response.data);
        } else {
          setError(response.error || 'Failed to fetch messages');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch messages';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [userId, isReady]);

  const refetch = useCallback(async () => {
    if (!user || !isReady) return;

    // Reset the ref to allow fetching again
    lastFetchedUidRef.current = null;
    setLoading(true);
    setError(null);
    
    try {
      const response = await getReceivedMessages();
      if (response.success && response.data) {
        setMessages(response.data);
      } else {
        setError(response.error || 'Failed to fetch messages');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch messages';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, isReady]);

  return { messages, loading, error, refetch };
}

