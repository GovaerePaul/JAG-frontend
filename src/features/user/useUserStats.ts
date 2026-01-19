'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUserStats } from './userSlice';
import {
  selectUserStats,
  selectUserStatsLoading,
} from './userSelectors';
import { useAuth } from '@/features/auth/useAuth';

interface MessageCounts {
  messagesSentCount: number;
  messagesReceivedCount: number;
}

interface UseUserStatsReturn {
  messageCounts: MessageCounts;
  loading: boolean;
  refetch: () => Promise<void>;
}

export function useUserStats(): UseUserStatsReturn {
  const dispatch = useAppDispatch();
  const { user, isReady } = useAuth();
  const stats = useAppSelector(selectUserStats);
  const loading = useAppSelector(selectUserStatsLoading);

  const userId = useMemo(() => user?.uid || null, [user?.uid]);

  useEffect(() => {
    if (!user || !isReady || !userId) return;
    if (stats && !loading) return;
    dispatch(fetchUserStats());
  }, [user, userId, isReady, stats, dispatch]);

  const refetch = useCallback(async () => {
    if (!user || !isReady) return;
    await dispatch(fetchUserStats());
  }, [dispatch, user, isReady]);

  const messageCounts: MessageCounts = useMemo(() => {
    return {
      messagesSentCount: stats?.messagesSentCount ?? 0,
      messagesReceivedCount: stats?.messagesReceivedCount ?? 0,
    };
  }, [stats]);

  return { messageCounts, loading, refetch };
}
