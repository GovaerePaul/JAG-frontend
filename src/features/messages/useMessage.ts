'use client';

import { useEffect, useCallback, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMessage } from './messagesSlice';
import { selectMessageById, selectMessagesLoading } from './messagesSelectors';
import { useAuth } from '@/features/auth/useAuth';
import { getCachedUserDisplayName } from '@/lib/user-cache';
import type { Message } from '@/lib/messages-api';

interface UseMessageReturn {
  message: Message | null;
  senderName: string;
  receiverName: string;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMessage(messageId: string | null): UseMessageReturn {
  const dispatch = useAppDispatch();
  const { user, isReady } = useAuth();
  const stableMessageId = useMemo(() => messageId || null, [messageId]);
  const message = useAppSelector((state) =>
    stableMessageId ? selectMessageById(stableMessageId)(state) : null
  );
  const loading = useAppSelector(selectMessagesLoading).message;
  const [senderName, setSenderName] = useState<string>('');
  const [receiverName, setReceiverName] = useState<string>('');

  useEffect(() => {
    if (!isReady || !user || !stableMessageId) return;

    // If message already exists in store, don't fetch
    if (message && !loading) return;

    dispatch(fetchMessage(stableMessageId));
  }, [stableMessageId, isReady, user, message, dispatch]);

  // Load sender and receiver names when message is available
  useEffect(() => {
    if (!message) {
      setSenderName('');
      setReceiverName('');
      return;
    }

    const loadNames = async () => {
      // Load sender name if not anonymous
      if (message.senderId && !message.isAnonymous) {
        const name = await getCachedUserDisplayName(message.senderId);
        setSenderName(name);
      } else {
        setSenderName('');
      }

      // Load receiver name
      if (message.receiverId) {
        const name = await getCachedUserDisplayName(message.receiverId);
        setReceiverName(name);
      } else {
        setReceiverName('');
      }
    };

    loadNames();
  }, [message]);

  const refetch = useCallback(async () => {
    if (!user || !isReady || !stableMessageId) return;
    await dispatch(fetchMessage(stableMessageId));
  }, [dispatch, user, isReady, stableMessageId]);

  const error = useAppSelector((state) => state.messages.error);

  return { message: message || null, senderName, receiverName, loading, error, refetch };
}
