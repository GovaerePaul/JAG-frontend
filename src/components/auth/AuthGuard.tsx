'use client';

import { useAuth } from '@/hooks/useAuth';
import { CircularProgress } from '@mui/material';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useEffect } from 'react';
import Navbar from '../Navbar';
import QuestCompletionModal from '../quests/QuestCompletionModal';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const isAuthPage = pathname.includes('/auth');

  useEffect(() => {
    if (!loading && !user && !isAuthPage) {
      router.push('/auth');
    }
  }, [user, loading, router, isAuthPage]);

  if (loading) {
    return (
      <div 
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress size={40} />
      </div>
    );
  }

  if (!user && !isAuthPage) {
    return null;
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flexGrow: 1 }}>
        {children}
      </main>
      <QuestCompletionModal />
    </div>
  );
}
