'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getMessage, Message } from '@/lib/messages-api';
import { useAuth } from './useAuth';
import { getCachedUserDisplayName } from '@/lib/user-cache';

interface UseMessageReturn {
  message: Message | null;
  senderName: string;
  receiverName: string;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMessage(messageId: string | null): UseMessageReturn {
  const { user, isReady } = useAuth();
  const [message, setMessage] = useState<Message | null>(null);
  const [senderName, setSenderName] = useState<string>('');
  const [receiverName, setReceiverName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedMessageIdRef = useRef<string | null>(null);

  // Stabilize messageId
  const stableMessageId = useMemo(() => messageId || null, [messageId]);

  const loadMessage = useCallback(async () => {
    if (!stableMessageId) {
      setMessage(null);
      setSenderName('');
      setReceiverName('');
      setLoading(false);
      setError(null);
      lastFetchedMessageIdRef.current = null;
      return;
    }

    // Skip if we already fetched for this messageId
    if (lastFetchedMessageIdRef.current === stableMessageId) {
      return;
    }

    lastFetchedMessageIdRef.current = stableMessageId;
    setLoading(true);
    setError(null);

    try {
      const response = await getMessage(stableMessageId);
      if (response.success && response.data) {
        const msg = response.data;
        setMessage(msg);

        // Load sender name if not anonymous
        if (msg.senderId && !msg.isAnonymous) {
          const name = await getCachedUserDisplayName(msg.senderId);
          setSenderName(name);
        } else {
          setSenderName('');
        }

        // Load receiver name
        if (msg.receiverId) {
          const name = await getCachedUserDisplayName(msg.receiverId);
          setReceiverName(name);
        } else {
          setReceiverName('');
        }
      } else {
        setError(response.error || 'Failed to fetch message');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch message';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [stableMessageId]);

  useEffect(() => {
    // Don't make API calls until user is authenticated and ready
    if (!isReady || !user) {
      setMessage(null);
      setSenderName('');
      setReceiverName('');
      setLoading(false);
      lastFetchedMessageIdRef.current = null;
      return;
    }

    loadMessage();
  }, [isReady, user, loadMessage]);

  const refetch = useCallback(async () => {
    if (!user || !isReady || !stableMessageId) return;

    // Reset the ref to allow fetching again
    lastFetchedMessageIdRef.current = null;
    await loadMessage();
  }, [user, isReady, stableMessageId, loadMessage]);

  return { message, senderName, receiverName, loading, error, refetch };
}
