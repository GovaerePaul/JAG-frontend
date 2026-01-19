'use client';

import { useAuth } from '@/features/auth/useAuth';
import { CircularProgress } from '@mui/material';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useEffect, useRef } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirectedRef = useRef(false);
  
  const isAuthPage = pathname.includes('/auth');

  useEffect(() => {
    // Only redirect once, and only if we're done loading and have no user
    if (!loading && !user && !isAuthPage && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.push('/auth');
    }
    
    // Reset redirect flag if user appears or we're on auth page
    if (user || isAuthPage) {
      hasRedirectedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, isAuthPage]);

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

  return <>{children}</>;
}
