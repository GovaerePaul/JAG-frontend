'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchReceivedMessages } from './messagesSlice';
import {
  selectReceivedMessages,
  selectReceivedMessagesLoading,
  selectMessagesError,
  selectReceivedMessagesLastFetched,
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
  const lastFetched = useAppSelector(selectReceivedMessagesLastFetched);

  const userId = useMemo(() => user?.uid || null, [user?.uid]);

  useEffect(() => {
    if (loading) return;
    if (!user || !isReady || !userId) return;
    if (lastFetched) return;
    dispatch(fetchReceivedMessages());
  }, [user, userId, isReady, lastFetched, loading, dispatch]);

  const refetch = useCallback(async () => {
    if (!user || !isReady) return;
    await dispatch(fetchReceivedMessages());
  }, [dispatch, user, isReady]);

  return { messages, loading, error, refetch };
}
