'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUserQuests } from './questsSlice';
import {
  selectUserQuests,
  selectQuestsLoading,
  selectQuestsError,
} from './questsSelectors';
import { useAuth } from '@/features/auth/useAuth';

interface UseQuestsReturn {
  quests: ReturnType<typeof selectUserQuests>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useQuests(): UseQuestsReturn {
  const dispatch = useAppDispatch();
  const { user, isReady } = useAuth();
  const quests = useAppSelector(selectUserQuests);
  const loading = useAppSelector(selectQuestsLoading);
  const error = useAppSelector(selectQuestsError);

  const userId = useMemo(() => user?.uid || null, [user?.uid]);

  useEffect(() => {
    if (!isReady || !userId) return;

    // If data already exists, don't fetch
    if (quests.length > 0 && !loading) return;

    dispatch(fetchUserQuests());
  }, [userId, isReady, quests.length, dispatch]);

  const refetch = useCallback(async () => {
    if (!user || !isReady) return;
    await dispatch(fetchUserQuests());
  }, [dispatch, user, isReady]);

  return { quests, loading, error, refetch };
}
