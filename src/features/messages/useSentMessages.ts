'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSentMessages } from './messagesSlice';
import {
  selectSentMessages,
  selectSentMessagesLoading,
  selectMessagesError,
} from './messagesSelectors';
import { useAuth } from '@/features/auth/useAuth';

interface UseSentMessagesReturn {
  messages: ReturnType<typeof selectSentMessages>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSentMessages(): UseSentMessagesReturn {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const messages = useAppSelector(selectSentMessages);
  const loading = useAppSelector(selectSentMessagesLoading);
  const error = useAppSelector(selectMessagesError);

  const userId = useMemo(() => user?.uid || null, [user?.uid]);

  useEffect(() => {
    if (!userId) return;

    // If data already exists, don't fetch
    if (messages.length > 0 && !loading) return;

    dispatch(fetchSentMessages());
  }, [userId, messages.length, dispatch]);

  const refetch = useCallback(async () => {
    if (!user) return;
    await dispatch(fetchSentMessages());
  }, [dispatch, user]);

  return { messages, loading, error, refetch };
}
