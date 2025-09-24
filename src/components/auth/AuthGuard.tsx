'use client';

import { useAuth } from '@/hooks/useAuth';
import { Box, CircularProgress } from '@mui/material';
import AuthPage from '@/app/auth/page';
import Navbar from '../Navbar';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // Show protected content with layout if authenticated
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
    </Box>
  );
}
