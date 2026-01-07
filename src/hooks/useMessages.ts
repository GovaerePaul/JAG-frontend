import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { Message, MessageSummary } from '@/lib/messages-api';

// Base type that both Message and MessageSummary share for user ID extraction
type MessageLike = {
  id: string;
  senderId: string | null;
  receiverId: string;
  isAnonymous: boolean;
};

interface UseMessagesOptions<T extends MessageLike> {
  fetchMessages: () => Promise<{ success: boolean; data?: T[]; error?: string }>;
  getUserIds: (messages: T[]) => string[];
}

export function useMessages<T extends MessageLike>({ fetchMessages, getUserIds }: UseMessagesOptions<T>) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  const loadUserNames = useCallback(async (msgs: T[]) => {
    const uniqueUserIds = [...new Set(getUserIds(msgs))];
    const namesMap: Record<string, string> = {};

    await Promise.all(
      uniqueUserIds.map(async (userId) => {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            namesMap[userId] = userData.displayName || userData.email || userId;
          } else {
            namesMap[userId] = userId;
          }
        } catch (err) {
          namesMap[userId] = userId;
        }
      })
    );

    setUserNames(namesMap);
  }, [getUserIds]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetchMessages();
        if (response.success && response.data) {
          setMessages(response.data);
          await loadUserNames(response.data);
        } else {
          setError(response.error || 'Failed to load messages');
        }
      } catch (err) {
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [user, fetchMessages, loadUserNames]);

  return { messages, loading, error, userNames };
}

