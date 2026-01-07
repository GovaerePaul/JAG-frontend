'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getUserQuests, UserQuestStatus } from '@/lib/quests-api';

interface UseQuestsReturn {
  quests: UserQuestStatus[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const questsCache = {
  data: null as UserQuestStatus[] | null,
  timestamp: 0,
  promise: null as Promise<void> | null,
};

export function invalidateQuestsCache() {
  questsCache.data = null;
  questsCache.timestamp = 0;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('questCacheInvalidated'));
  }
}

const CACHE_DURATION = 60000;

export function useQuests(): UseQuestsReturn {
  const { user } = useAuth();
  const [quests, setQuests] = useState<UserQuestStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuests = useCallback(async () => {
    if (!user) {
      setQuests([]);
      return;
    }

    const now = Date.now();
    if (questsCache.data && (now - questsCache.timestamp) < CACHE_DURATION) {
      setQuests(questsCache.data);
      return;
    }

    if (questsCache.promise) {
      await questsCache.promise;
      if (questsCache.data) {
        setQuests(questsCache.data);
      }
      return;
    }

    setLoading(true);
    setError(null);
    const fetchPromise = (async () => {
      try {
        const response = await getUserQuests();
        if (response.success && response.data) {
          questsCache.data = response.data;
          questsCache.timestamp = Date.now();
          setQuests(response.data);
        } else {
          setError(response.error || 'Failed to fetch quests');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch quests';
        setError(errorMessage);
      } finally {
        setLoading(false);
        questsCache.promise = null;
      }
    })();

    questsCache.promise = fetchPromise;
    await fetchPromise;
  }, [user]);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const refetch = useCallback(async () => {
    invalidateQuestsCache();
    await fetchQuests();
  }, [fetchQuests]);

  return { quests, loading, error, refetch };
}

