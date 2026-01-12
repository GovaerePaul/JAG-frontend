'use client';

import React from 'react';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { useUserStats } from '@/hooks/useUserStats';
import { AppDataProvider } from '@/contexts/AppDataContext';
import { EventTypesProvider } from '@/contexts/EventTypesContext';
import Navbar from '../Navbar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, userProfile, canSend, canReceive, isReady } = useAuth();
  // useUnreadMessages already calls useReceivedMessages internally, so we get both
  const { unreadCount, messages: receivedMessages, refetch: refetchUnreadMessages } = useUnreadMessages();
  const { messageCounts, refetch: refetchUserStats } = useUserStats();
  // refetchReceivedMessages is the same as refetchUnreadMessages since they share the same hook
  const refetchReceivedMessages = refetchUnreadMessages;

  // Debug log
  if (process.env.NODE_ENV === 'development') {
    console.log('[AppLayout] render:', { isReady, hasUser: !!user, uid: user?.uid });
  }

  // Show loading state until user is authenticated and ready
  if (!isReady) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  // Share data via Context - this avoids duplicate API calls and works perfectly with Next.js
  return (
    <AppDataProvider
      value={{
        user,
        userProfile,
        canSend,
        canReceive,
        unreadCount,
        messageCounts,
        receivedMessages,
        refetchReceivedMessages,
        refetchUserStats,
        refetchUnreadMessages,
      }}
    >
      <EventTypesProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar user={user} canReceive={canReceive} unreadCount={unreadCount} />
          <main style={{ flexGrow: 1 }}>
            {children}
          </main>
        </div>
      </EventTypesProvider>
    </AppDataProvider>
  );
}
