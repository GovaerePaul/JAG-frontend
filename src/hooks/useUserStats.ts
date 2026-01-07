'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import authApiClient from '@/lib/api-client';
import { UserStats } from '@/lib/types';

interface MessageCounts {
  messagesSentCount: number;
  messagesReceivedCount: number;
}

interface UseUserStatsReturn {
  messageCounts: MessageCounts;
  loading: boolean;
  refetch: () => Promise<void>;
}

// Global cache to share stats across components
export const userStatsCache = {
  data: null as MessageCounts | null,
  timestamp: 0,
  promise: null as Promise<void> | null,
};

export function invalidateUserStatsCache() {
  userStatsCache.data = null;
  userStatsCache.timestamp = 0;
}

const CACHE_DURATION = 30000; // 30 seconds

export function useUserStats(): UseUserStatsReturn {
  const { user } = useAuth();
  const [messageCounts, setMessageCounts] = useState<MessageCounts>({
    messagesSentCount: 0,
    messagesReceivedCount: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setMessageCounts({ messagesSentCount: 0, messagesReceivedCount: 0 });
      return;
    }

    // Check cache first
    const now = Date.now();
    if (userStatsCache.data && (now - userStatsCache.timestamp) < CACHE_DURATION) {
      setMessageCounts(userStatsCache.data);
      return;
    }

    // If already fetching, wait for that promise
    if (userStatsCache.promise) {
      await userStatsCache.promise;
      if (userStatsCache.data) {
        setMessageCounts(userStatsCache.data);
      }
      return;
    }

    setLoading(true);
    const fetchPromise = (async () => {
      try {
        const response = await authApiClient.getUserStats();
        if (response.success && response.data) {
          const stats = response.data as UserStats;
          const counts = {
            messagesSentCount: stats.messagesSentCount ?? 0,
            messagesReceivedCount: stats.messagesReceivedCount ?? 0,
          };
          userStatsCache.data = counts;
          userStatsCache.timestamp = Date.now();
          setMessageCounts(counts);
        }
      } catch (error) {
        // Silent fail
      } finally {
        setLoading(false);
        userStatsCache.promise = null;
      }
    })();

    userStatsCache.promise = fetchPromise;
    await fetchPromise;
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refetch = useCallback(async () => {
    invalidateUserStatsCache();
    await fetchStats();
  }, [fetchStats]);

  return { messageCounts, loading, refetch };
}

