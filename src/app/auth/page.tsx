'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Box,
  Slide,
  useTheme,
  useMediaQuery
} from '@mui/material';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { useAuth } from '@/hooks/useAuth';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Rediriger si déjà connecté
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSwitchToRegister = () => {
    setSlideDirection('left');
    setIsLogin(false);
  };

  const handleSwitchToLogin = () => {
    setSlideDirection('right');
    setIsLogin(true);
  };

  const handleAuthSuccess = () => {
    router.push('/');
  };

  if (user) {
    return null; // Ou un loading spinner
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 3,
            p: { xs: 3, sm: 4 },
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          }}
        >
          {/* Formes décoratives */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              opacity: 0.1,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              opacity: 0.1,
            }}
          />

          {/* Contenu principal */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Slide
              direction={slideDirection}
              in={isLogin}
              timeout={300}
              mountOnEnter
              unmountOnExit
            >
              <Box>
                <LoginForm
                  onSuccess={handleAuthSuccess}
                  onSwitchToRegister={handleSwitchToRegister}
                />
              </Box>
            </Slide>

            <Slide
              direction={slideDirection === 'left' ? 'right' : 'left'}
              in={!isLogin}
              timeout={300}
              mountOnEnter
              unmountOnExit
            >
              <Box>
                <RegisterForm
                  onSuccess={handleAuthSuccess}
                  onSwitchToLogin={handleSwitchToLogin}
                />
              </Box>
            </Slide>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
