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
    console.log('📊 fetchStats called, user:', user ? 'exists' : 'null');
    
    if (!user) {
      console.log('📊 No user, setting counts to 0');
      setMessageCounts({ messagesSentCount: 0, messagesReceivedCount: 0 });
      return;
    }

    // If already fetching, wait for that promise
    if (fetchingRef.current) {
      console.log('📊 Already fetching, waiting...');
      await fetchingRef.current;
      return;
    }

    console.log('📊 Starting fetch...');
    setLoading(true);
    const fetchPromise = (async () => {
      try {
        // Send email to backend as fallback (for Facebook OAuth case)
        const userEmail = user.email || user.providerData?.[0]?.email;
        const response = await authApiClient.getUserStats(userEmail || undefined);
        
        console.log('📊 getUserStats response:', response);
        console.log('📊 response.success:', response.success);
        console.log('📊 response.data:', response.data);
        console.log('📊 typeof response.data:', typeof response.data);
        
        if (response.success && response.data) {
          // Handle case where data might be wrapped in 'result' property
          let statsData = response.data;
          if (statsData && typeof statsData === 'object' && 'result' in statsData) {
            statsData = (statsData as any).result;
            console.log('📊 Unwrapped result:', statsData);
          }
          
          const stats = statsData as UserStats;
          console.log('📊 Parsed stats:', stats);
          console.log('📊 messagesSentCount:', stats.messagesSentCount);
          console.log('📊 messagesReceivedCount:', stats.messagesReceivedCount);
          
          const counts = {
            messagesSentCount: stats.messagesSentCount ?? 0,
            messagesReceivedCount: stats.messagesReceivedCount ?? 0,
          };
          console.log('📊 Setting counts:', counts);
          setMessageCounts(counts);
        } else {
          console.warn('⚠️ getUserStats failed or no data:', response);
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

