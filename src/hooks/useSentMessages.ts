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

    setLoading(true);
    setError(null);
    
    try {
      const response = await getSentMessages();
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
  }, [user]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const refetch = useCallback(async () => {
    await fetchMessages();
  }, [fetchMessages]);

  return { messages, loading, error, refetch };
}

