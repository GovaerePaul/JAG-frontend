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
  
  const { unreadCount } = useUnreadMessages();

  if (isAuthPage) {
    return <>{children}</>;
  }

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

  if (!user) {
    return null;
  }

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar user={user} canReceive={canReceive} unreadCount={unreadCount} />
      <main style={{ flexGrow: 1 }}>
        {children}
      </main>
    </div>
  );
}
