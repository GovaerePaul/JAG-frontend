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

  useEffect(() => {
    if (!user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    const fetchMessages = async () => {
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
    };

    fetchMessages();
  }, [user?.uid]);

  const refetch = useCallback(async () => {
    if (!user) return;

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

  return { messages, loading, error, refetch };
}

