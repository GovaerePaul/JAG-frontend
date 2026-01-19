'use client';

import { useEffect, useCallback, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMessage } from './messagesSlice';
import { selectMessageById, selectMessagesLoading } from './messagesSelectors';
import { useAuth } from '@/features/auth/useAuth';
import { getCachedUserDisplayName } from '@/lib/user-cache';
import type { Message } from '@/types/messages';

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
    if (message && !loading) return;
    dispatch(fetchMessage(stableMessageId));
  }, [stableMessageId, isReady, user, message, dispatch]);

  useEffect(() => {
    // Early return without setState - states are initialized to '' by default
    if (!message) return;

    let cancelled = false;

    const loadNames = async () => {
      let newSenderName = '';
      let newReceiverName = '';

      if (message.senderId && !message.isAnonymous) {
        newSenderName = await getCachedUserDisplayName(message.senderId);
      }

      if (message.receiverId) {
        newReceiverName = await getCachedUserDisplayName(message.receiverId);
      }

      if (!cancelled) {
        setSenderName(newSenderName);
        setReceiverName(newReceiverName);
      }
    };

    loadNames();

    return () => {
      cancelled = true;
    };
  }, [message]);

  const refetch = useCallback(async () => {
    if (!user || !isReady || !stableMessageId) return;
    await dispatch(fetchMessage(stableMessageId));
  }, [dispatch, user, isReady, stableMessageId]);

  const error = useAppSelector((state) => state.messages.error);

  return { message: message || null, senderName, receiverName, loading, error, refetch };
}
