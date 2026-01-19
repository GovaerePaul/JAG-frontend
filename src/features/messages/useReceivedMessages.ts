'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchReceivedMessages } from './messagesSlice';
import {
  selectReceivedMessages,
  selectReceivedMessagesLoading,
  selectMessagesError,
} from './messagesSelectors';
import { useAuth } from '@/features/auth/useAuth';

interface UseReceivedMessagesReturn {
  messages: ReturnType<typeof selectReceivedMessages>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useReceivedMessages(): UseReceivedMessagesReturn {
  const dispatch = useAppDispatch();
  const { user, isReady } = useAuth();
  const messages = useAppSelector(selectReceivedMessages);
  const loading = useAppSelector(selectReceivedMessagesLoading);
  const error = useAppSelector(selectMessagesError);

  const userId = useMemo(() => user?.uid || null, [user?.uid]);

  useEffect(() => {
    if (!user || !isReady || !userId) return;
    if (messages.length > 0 && !loading) return;
    dispatch(fetchReceivedMessages());
  }, [user, userId, isReady, messages.length, dispatch]);

  const refetch = useCallback(async () => {
    if (!user || !isReady) return;
    await dispatch(fetchReceivedMessages());
  }, [dispatch, user, isReady]);

  return { messages, loading, error, refetch };
}
