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

    // If already fetching, wait for that promise and return
    // The state will be updated by the first fetch
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
          // Use functional update to ensure React detects the change
          setMessageCounts((prev) => {
            console.log('📊 Previous counts:', prev);
            console.log('📊 New counts:', counts);
            // Only update if values actually changed
            if (prev.messagesSentCount !== counts.messagesSentCount || 
                prev.messagesReceivedCount !== counts.messagesReceivedCount) {
              console.log('📊 Values changed, updating state');
              return counts;
            }
            console.log('📊 Values unchanged, keeping previous state');
            return prev;
          });
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

  console.log('📊 useUserStats return - messageCounts:', messageCounts, 'loading:', loading);
  
  return { messageCounts, loading, refetch };
}

