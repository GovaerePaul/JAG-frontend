'use client';

import { useAuth } from '@/features/auth/useAuth';
import { useUnreadMessages } from '@/features/messages/useUnreadMessages';
import { useUserStats } from '@/features/user/useUserStats';
import HomePage from '@/components/HomePage';

export default function LocaleHomePage() {
  const { user, userProfile, canSend, canReceive } = useAuth();
  const { unreadCount } = useUnreadMessages();
  const { messageCounts } = useUserStats();

  return (
    <HomePage
      user={user}
      userProfile={userProfile}
      canSend={canSend}
      canReceive={canReceive}
      unreadCount={unreadCount}
      messageCounts={messageCounts}
    />
  );
}
