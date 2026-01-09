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

export function useUserStats(): UseUserStatsReturn {
  const { user } = useAuth();
  const [messageCounts, setMessageCounts] = useState<MessageCounts>({
    messagesSentCount: 0,
    messagesReceivedCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMessageCounts({ messagesSentCount: 0, messagesReceivedCount: 0 });
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const fetchStats = async () => {
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
  }, [user?.uid, user?.email]);

  const refetch = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    
    try {
      const userEmail = user.email || user.providerData?.[0]?.email;
      const response = await authApiClient.getUserStats(userEmail || undefined);
      
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

