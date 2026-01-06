import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { Message } from '@/lib/messages-api';

interface UseMessagesOptions {
  fetchMessages: () => Promise<{ success: boolean; data?: Message[]; error?: string }>;
  getUserIds: (messages: Message[]) => string[];
}

export function useMessages({ fetchMessages, getUserIds }: UseMessagesOptions) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  const loadUserNames = useCallback(async (msgs: Message[]) => {
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
          console.error(`Error fetching user ${userId}:`, err);
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
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [user, fetchMessages, loadUserNames]);

  return { messages, loading, error, userNames };
}

