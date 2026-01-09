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

export function useQuests(): UseQuestsReturn {
  const { user } = useAuth();
  const [quests, setQuests] = useState<UserQuestStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuests = useCallback(async () => {
    if (!user) {
      setQuests([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await getUserQuests();
      if (response.success && response.data) {
        setQuests(response.data);
      } else {
        setError(response.error || 'Failed to fetch quests');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch quests';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const refetch = useCallback(async () => {
    await fetchQuests();
  }, [fetchQuests]);

  return { quests, loading, error, refetch };
}

