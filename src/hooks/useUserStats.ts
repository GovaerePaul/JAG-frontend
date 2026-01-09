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
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef<Promise<void> | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setMessageCounts({ messagesSentCount: 0, messagesReceivedCount: 0 });
      setLoading(false);
      return;
    }

    // If already fetching, wait for that promise and return
    // The state will be updated by the first fetch
    if (fetchingRef.current) {
      await fetchingRef.current;
      return;
    }

    console.log('📊 Setting loading to true');
    setLoading(true);
    const fetchPromise = (async () => {
      try {
        // Send email to backend as fallback (for Facebook OAuth case)
        const userEmail = user.email || user.providerData?.[0]?.email;
        console.log('📊 Fetching stats for email:', userEmail);
        const response = await authApiClient.getUserStats(userEmail || undefined);
        
        if (response.success && response.data) {
          // Handle case where data might be wrapped in 'result' property
          let statsData = response.data;
          if (statsData && typeof statsData === 'object' && 'result' in statsData) {
            statsData = (statsData as any).result;
          }
          
          const stats = statsData as UserStats;
          const counts = {
            messagesSentCount: stats.messagesSentCount ?? 0,
            messagesReceivedCount: stats.messagesReceivedCount ?? 0,
          };
          
          console.log('📊 Setting counts:', counts);
          // Force update - always set new object to ensure React detects change
          setMessageCounts({
            messagesSentCount: counts.messagesSentCount,
            messagesReceivedCount: counts.messagesReceivedCount,
          });
          console.log('📊 State update called, setting loading to false');
        } else {
          console.warn('📊 No data in response:', response);
        }
      } catch (error) {
        console.error('❌ Error fetching user stats:', error);
      } finally {
        console.log('📊 Setting loading to false');
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

  console.log('📊 useUserStats return - messageCounts:', messageCounts, 'loading:', loading);
  
  return { messageCounts, loading, refetch };
}

