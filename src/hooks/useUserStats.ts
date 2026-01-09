'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  const lastFetchedUidRef = useRef<string | null>(null);

  // Stabilize user identifier
  const userId = useMemo(() => user?.uid || null, [user?.uid]);

  useEffect(() => {
    if (!userId) {
      setMessageCounts({ messagesSentCount: 0, messagesReceivedCount: 0 });
      setLoading(false);
      lastFetchedUidRef.current = null;
      return;
    }

    // Skip if we already fetched for this user
    if (lastFetchedUidRef.current === userId) {
      return;
    }

    lastFetchedUidRef.current = userId;
    setLoading(true);
    
    const fetchStats = async () => {
      try {
        const response = await authApiClient.getUserStats();
        
        if (response.success && response.data) {
          // Handle case where data might be wrapped in 'result' property
          let statsData = response.data;
          if (statsData && typeof statsData === 'object' && 'result' in statsData) {
            statsData = (statsData as any).result;
          }
          
          const stats = statsData as UserStats;
          setMessageCounts({
            messagesSentCount: stats.messagesSentCount ?? 0,
            messagesReceivedCount: stats.messagesReceivedCount ?? 0,
          });
        }
      } catch (error) {
        console.error('❌ Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  const refetch = useCallback(async () => {
    if (!user) return;

    // Reset the ref to allow fetching again
    lastFetchedUidRef.current = null;
    setLoading(true);
    
    try {
      const response = await authApiClient.getUserStats();
      
      if (response.success && response.data) {
        let statsData = response.data;
        if (statsData && typeof statsData === 'object' && 'result' in statsData) {
          statsData = (statsData as any).result;
        }
        
        const stats = statsData as UserStats;
        setMessageCounts({
          messagesSentCount: stats.messagesSentCount ?? 0,
          messagesReceivedCount: stats.messagesReceivedCount ?? 0,
        });
      }
    } catch (error) {
      console.error('❌ Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  return { messageCounts, loading, refetch };
}

