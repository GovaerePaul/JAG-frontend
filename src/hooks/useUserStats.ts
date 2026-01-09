'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

export function useUserStats(): UseUserStatsReturn {
  const { user } = useAuth();
  const [messageCounts, setMessageCounts] = useState<MessageCounts>({
    messagesSentCount: 0,
    messagesReceivedCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const fetchingRef = useRef<Promise<void> | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setMessageCounts({ messagesSentCount: 0, messagesReceivedCount: 0 });
      return;
    }

    // If already fetching, wait for that promise
    if (fetchingRef.current) {
      await fetchingRef.current;
      return;
    }

    setLoading(true);
    const fetchPromise = (async () => {
      try {
        // Send email to backend as fallback (for Facebook OAuth case)
        const userEmail = user.email || user.providerData?.[0]?.email;
        const response = await authApiClient.getUserStats(userEmail || undefined);
        
        if (response.success && response.data) {
          const stats = response.data as UserStats;
          const counts = {
            messagesSentCount: stats.messagesSentCount ?? 0,
            messagesReceivedCount: stats.messagesReceivedCount ?? 0,
          };
          setMessageCounts(counts);
        }
      } catch (error) {
        console.error('❌ Error fetching user stats:', error);
      } finally {
        setLoading(false);
        fetchingRef.current = null;
      }
    })();

    fetchingRef.current = fetchPromise;
    await fetchPromise;
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refetch = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  return { messageCounts, loading, refetch };
}

