'use client';

import { useMemo } from 'react';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { Explore } from '@mui/icons-material';
import { useRouter } from '@/i18n/navigation';
import { User } from 'firebase/auth';
import { UserProfile } from '@/features/auth/useAuth';
import { useTranslations } from 'next-intl';
import { getUserEmail } from '@/lib/userUtils';
import GradientTypography from '@/components/ui/GradientTypography';
import StyledPaper from '@/components/ui/StyledPaper';
import GradientButton from '@/components/ui/GradientButton';
import GamificationCard from '@/components/gamification/GamificationCard';
import UserDashboardCard from '@/components/dashboard/UserDashboardCard';

interface GamificationData {
  points: number;
  level: number;
  totalPointsEarned: number;
}

interface MessageCounts {
  messagesSentCount: number;
  messagesReceivedCount: number;
}

interface HomePageProps {
  user: User | null;
  userProfile: UserProfile | null;
  canSend: boolean;
  canReceive: boolean;
  unreadCount: number;
  messageCounts: MessageCounts;
}

export default function HomePage({
  user,
  userProfile,
  canSend,
  canReceive,
  unreadCount,
  messageCounts,
}: HomePageProps) {
  const router = useRouter();
  const t = useTranslations('home');
  const tCommon = useTranslations('common');

  // Use userProfile from useAuth for gamification
  // Memoize to ensure React detects changes when userProfile updates
  // IMPORTANT: All hooks must be called before any conditional returns
  const gamification: GamificationData = useMemo(
    () => ({
      points: userProfile?.points ?? 0,
      level: userProfile?.level ?? 1,
      totalPointsEarned: userProfile?.totalPointsEarned ?? 0,
    }),
    [userProfile?.points, userProfile?.level, userProfile?.totalPointsEarned]
  );

  // Show loading if no user (AuthGuard will redirect to /auth)
  if (!user) {
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
    <Box
      sx={{
        py: 4,
        position: 'relative',
        minHeight: '100vh',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #fef5f8 0%, #fff5f0 50%, #f0f8ff 100%)',
          zIndex: -1,
        },
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <GradientTypography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}
          >
            {t('title')}
          </GradientTypography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ mb: 4, fontSize: { xs: '1.2rem', md: '1.5rem' } }}
          >
            {t('welcomeUser', { name: user.displayName || getUserEmail(user) || tCommon('user') })}
          </Typography>
        </Box>

        <GamificationCard
          level={gamification.level}
          points={gamification.points}
          totalPointsEarned={gamification.totalPointsEarned}
          showViewQuestsButton={true}
        />

        <UserDashboardCard
          canReceive={canReceive}
          canSend={canSend}
          unreadCount={unreadCount}
          messageCounts={messageCounts}
        />

        {/* Discover Users Button */}
        <StyledPaper sx={{ p: 4, textAlign: 'center' }}>
          <GradientTypography variant="h6" gutterBottom sx={{ mb: 2 }}>
            {t('discoverUsers.title')}
          </GradientTypography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t('discoverUsers.description')}
          </Typography>
          <GradientButton
            size="large"
            startIcon={<Explore />}
            onClick={() => router.push('/discover')}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
            }}
          >
            {t('discoverUsers.button')}
          </GradientButton>
        </StyledPaper>
      </Container>
    </Box>
  );
}
