'use client';

import React from 'react';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '@/features/auth/useAuth';
import { useUnreadMessages } from '@/features/messages/useUnreadMessages';
import { usePathname } from '@/i18n/navigation';
import Navbar from '../Navbar';
import MobileHeader from './MobileHeader';
import BottomNav from './BottomNav';
import { BOTTOM_NAV_HEIGHT } from '@/theme/layoutConstants';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, canReceive, authLoading, isReady } = useAuth();
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

  const statusBarHeight = {
    xs: 'max(env(safe-area-inset-top, 0px), 28px)',
    md: 'env(safe-area-inset-top, 0px)',
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      {/* Sticky spacer: réserve toujours la zone status bar, même au scroll */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1300,
          flexShrink: 0,
          height: statusBarHeight,
          minHeight: statusBarHeight,
          background: '#ffffff',
        }}
      />
      <Navbar user={user} canReceive={canReceive} unreadCount={unreadCount} />
      <MobileHeader />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          paddingBottom: {
            xs: `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom))`,
            md: 0,
          },
        }}
      >
        {children}
      </Box>
      <BottomNav unreadCount={unreadCount} user={user} />
    </Box>
  );
}
