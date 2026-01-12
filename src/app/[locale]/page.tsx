'use client';

import { useAppData } from '@/contexts/AppDataContext';
import HomePage from '@/components/HomePage';

export default function LocaleHomePage() {
  // Use Context instead of hooks to avoid duplicate API calls
  const { user, userProfile, canSend, canReceive, unreadCount, messageCounts } = useAppData();

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
