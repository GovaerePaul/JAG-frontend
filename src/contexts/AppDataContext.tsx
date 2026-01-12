'use client';

import React, { createContext, useContext } from 'react';
import { User } from 'firebase/auth';
import { UserProfile } from '@/hooks/useAuth';
import { MessageSummary } from '@/lib/messages-api';

interface MessageCounts {
  messagesSentCount: number;
  messagesReceivedCount: number;
}

interface AppDataContextValue {
  user: User | null;
  userProfile: UserProfile | null;
  canSend: boolean;
  canReceive: boolean;
  unreadCount: number;
  messageCounts: MessageCounts;
  receivedMessages: MessageSummary[];
  refetchReceivedMessages: () => Promise<void>;
  refetchUserStats: () => Promise<void>;
  refetchUnreadMessages: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}

interface AppDataProviderProps {
  children: React.ReactNode;
  value: AppDataContextValue;
}

export function AppDataProvider({ children, value }: AppDataProviderProps) {
  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}
