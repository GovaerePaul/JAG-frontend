'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from '@/i18n/navigation';
import {
  Container,
  Paper,
  Box,
  Slide,
  Typography
} from '@mui/material';
import { Favorite, AutoAwesome } from '@mui/icons-material';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { useAuth } from '@/hooks/useAuth';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const { user, loading } = useAuth();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    // Only redirect once, and only if we're done loading and have a user
    if (!loading && user && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.push('/');
    }
    
    // Reset redirect flag if user disappears
    if (!user) {
      hasRedirectedRef.current = false;
    }
  }, [user, loading, router]);

  const handleSwitchToRegister = () => {
    setSlideDirection('left');
    setIsLogin(false);
  };

  const handleSwitchToLogin = () => {
    setSlideDirection('right');
    setIsLogin(true);
  };

  const handleAuthSuccess = () => {
    // Prevent multiple redirects
    if (!hasRedirected) {
      setHasRedirected(true);
      router.push('/');
    }
  };

  if (user) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        py: 4,
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #fef5f8 0%, #fff5f0 50%, #f0f8ff 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(254, 107, 139, 0.15) 0%, rgba(255, 142, 83, 0.15) 100%)',
          filter: 'blur(80px)',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-30%',
          left: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(255, 142, 83, 0.12) 0%, rgba(254, 107, 139, 0.12) 100%)',
          filter: 'blur(70px)',
          zIndex: 0,
        },
      }}
    >
      <Container component="main" maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.5,
              mb: 2,
            }}
          >
            <Box
              sx={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Favorite
                sx={{
                  fontSize: { xs: 40, sm: 48 },
                  color: '#FE6B8B',
                  animation: 'pulse 2s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': {
                      transform: 'scale(1)',
                      opacity: 1,
                    },
                    '50%': {
                      transform: 'scale(1.1)',
                      opacity: 0.8,
                    },
                  },
                }}
              />
              <AutoAwesome
                sx={{
                  position: 'absolute',
                  fontSize: 20,
                  color: '#FF8E53',
                  top: -5,
                  right: -5,
                  animation: 'sparkle 1.5s ease-in-out infinite',
                  '@keyframes sparkle': {
                    '0%, 100%': {
                      opacity: 0.6,
                      transform: 'scale(1) rotate(0deg)',
                    },
                    '50%': {
                      opacity: 1,
                      transform: 'scale(1.2) rotate(180deg)',
                    },
                  },
                }}
              />
            </Box>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2rem', sm: '2.5rem' },
                letterSpacing: '0.05em',
              }}
            >
              JustGift
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '0.95rem', sm: '1rem' },
              fontWeight: 400,
            }}
          >
            Partagez de la bienveillance, un message à la fois
          </Typography>
        </Box>

        <Paper
          elevation={12}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 4,
            p: { xs: 3, sm: 5 },
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 8px 32px rgba(254, 107, 139, 0.1)',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -100,
              right: -100,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(254, 107, 139, 0.08) 0%, rgba(255, 142, 83, 0.08) 100%)',
              filter: 'blur(40px)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -80,
              left: -80,
              width: 250,
              height: 250,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(255, 142, 83, 0.06) 0%, rgba(254, 107, 139, 0.06) 100%)',
              filter: 'blur(35px)',
            }}
          />

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
      </Container>
    </Box>
  );
}
