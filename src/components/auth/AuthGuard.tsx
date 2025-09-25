'use client';

import { useAuth } from '@/hooks/useAuth';
import { CircularProgress } from '@mui/material';
import AuthPage from '@/app/auth/page';
import Navbar from '../Navbar';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();

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

  if (!user) {
    return <AuthPage />;
  }

  // Show protected content with layout if authenticated
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flexGrow: 1 }}>
        {children}
      </main>
    </div>
  );
}
