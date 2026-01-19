'use client';

import React from 'react';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '@/features/auth/useAuth';
import { useUnreadMessages } from '@/features/messages/useUnreadMessages';
import { usePathname } from '@/i18n/navigation';
import Navbar from '../Navbar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, canReceive, authLoading } = useAuth();
  const pathname = usePathname();
  const isAuthPage = pathname.includes('/auth');
  
  // useUnreadMessages already calls useReceivedMessages internally, so we get both
  const { unreadCount } = useUnreadMessages();

  // Auth page should always be accessible, render it directly without layout
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Show loading state only while auth is loading
  // If auth is done and no user, AuthGuard will handle the redirect
  if (authLoading) {
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

  // If auth is done but no user, return null (AuthGuard will redirect)
  if (!user) {
    return null;
  }

  // Show loading state until user profile is ready (but user is authenticated)
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

  // Redux handles all data now, no need for Context providers
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar user={user} canReceive={canReceive} unreadCount={unreadCount} />
      <main style={{ flexGrow: 1 }}>
        {children}
      </main>
    </div>
  );
}
