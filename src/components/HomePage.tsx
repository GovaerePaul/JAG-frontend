'use client';

import { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import { Send, Inbox, Outbox, EmojiEvents, Explore } from '@mui/icons-material';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';
import SendMessageForm from '@/components/messages/SendMessageForm';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { useUserStats } from '@/hooks/useUserStats';
import NotificationBadge from '@/components/NotificationBadge';
import LevelIcon from '@/components/LevelIcon';
import { getUserEmail } from '@/lib/userUtils';

interface GamificationData {
  points: number;
  level: number;
  totalPointsEarned: number;
}

export default function HomePage() {
  const { user, userProfile, canSend, canReceive } = useAuth();
  const router = useRouter();
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const tGamification = useTranslations('gamification');
  const { unreadCount } = useUnreadMessages();
  const { messageCounts, loading: loadingCounts, refetch: refetchStats } = useUserStats();
  const [sendMessageOpen, setSendMessageOpen] = useState(false);

  // Use userProfile from useAuth for gamification (auto-updates via onSnapshot)
  // Memoize to ensure React detects changes when userProfile updates
  const gamification: GamificationData = useMemo(() => ({
    points: userProfile?.points ?? 0,
    level: userProfile?.level ?? 1,
    totalPointsEarned: userProfile?.totalPointsEarned ?? 0,
  }), [userProfile?.points, userProfile?.level, userProfile?.totalPointsEarned]);

  const receivedCount = messageCounts.messagesReceivedCount;
  const sentCount = messageCounts.messagesSentCount;
  
  const currentLevelPoints = (gamification.level - 1) * 100;
  const nextLevelPoints = gamification.level * 100;
  const pointsInCurrentLevel = gamification.points - currentLevelPoints;
  const pointsNeededForNextLevel = nextLevelPoints - gamification.points;
  const progressPercentage = (pointsInCurrentLevel / 100) * 100;

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
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            {t('title')}
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ mb: 4, fontSize: { xs: '1.2rem', md: '1.5rem' } }}
          >
            {user
              ? t('welcomeUser', { name: user.displayName || getUserEmail(user) || tCommon('user') })
              : t('subtitle')
            }
          </Typography>
          {!user && (
            <Button
              variant="contained"
              size="large"
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                boxShadow: '0 4px 15px rgba(254, 107, 139, 0.3)',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FE6B8B 40%, #FF8E53 100%)',
                  boxShadow: '0 6px 20px rgba(254, 107, 139, 0.4)',
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => router.push('/auth')}
            >
              {t('getStarted')}
            </Button>
          )}
        </Box>

        {user && (
          <>
            <Paper
              elevation={12}
              sx={{
                p: 4,
                mb: 3,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 8px 32px rgba(254, 107, 139, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(254, 107, 139, 0.08) 0%, rgba(255, 142, 83, 0.08) 100%)',
                  filter: 'blur(40px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2, position: 'relative', zIndex: 1 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(254, 107, 139, 0.1) 0%, rgba(255, 142, 83, 0.1) 100%)',
                  }}
                >
                  <LevelIcon level={gamification.level} size={56} />
                </Box>
                <Box>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    {tGamification('level')} {gamification.level}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {gamification.points} {tGamification('points')}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {tGamification('progress')}: {pointsInCurrentLevel}/100
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {tGamification('nextLevel')}: {pointsNeededForNextLevel} {tGamification('points')}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progressPercentage}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: 'rgba(254, 107, 139, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                      borderRadius: 5,
                    },
                  }}
                />
              </Box>
              <Box sx={{ mt: 3, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <Button
                  variant="outlined"
                  size="medium"
                  startIcon={<EmojiEvents />}
                  sx={{
                    borderRadius: 2,
                    borderColor: '#FE6B8B',
                    color: '#FE6B8B',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    '&:hover': {
                      borderColor: '#FE6B8B',
                      background: 'rgba(254, 107, 139, 0.08)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(254, 107, 139, 0.2)',
                    },
                  }}
                  onClick={() => router.push('/quests')}
                >
                  {t('viewQuests')}
                </Button>
              </Box>
            </Paper>

            <Paper
              elevation={12}
              sx={{
                p: 4,
                textAlign: 'center',
                mb: 3,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 8px 32px rgba(254, 107, 139, 0.1)',
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {t('userDashboard.title')}
              </Typography>
              <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 4,
                mt: 3,
                justifyContent: 'center'
              }}>
                {(canReceive || receivedCount > 0) && (
                  <Box
                    sx={{
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: canReceive ? 'pointer' : 'default',
                      p: 3,
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      background: 'linear-gradient(135deg, rgba(254, 107, 139, 0.05) 0%, rgba(255, 142, 83, 0.05) 100%)',
                      '&:hover': canReceive ? {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(254, 107, 139, 0.2)',
                        background: 'linear-gradient(135deg, rgba(254, 107, 139, 0.1) 0%, rgba(255, 142, 83, 0.1) 100%)',
                      } : {},
                    }}
                    onClick={canReceive ? () => router.push('/messages/received') : undefined}
                  >
                    <NotificationBadge count={unreadCount} pulse={unreadCount > 0}>
                      <Inbox
                        sx={{
                          fontSize: 40,
                          mb: 1,
                          background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      />
                    </NotificationBadge>
                    {loadingCounts ? (
                      <CircularProgress size={24} sx={{ my: 1 }} />
                    ) : (
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 'bold',
                          background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {receivedCount}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
                      {t('userDashboard.messagesReceived')}
                    </Typography>
                    {unreadCount > 0 && (
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 0.5,
                          color: '#FE6B8B',
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                        }}
                      >
                        {unreadCount} {unreadCount === 1 ? t('userDashboard.newMessage') : t('userDashboard.newMessages')}
                      </Typography>
                    )}
                  </Box>
                )}
                {(canSend || sentCount > 0) && (
                  <Box
                    sx={{
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: canSend ? 'pointer' : 'default',
                      p: 3,
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      background: 'linear-gradient(135deg, rgba(254, 107, 139, 0.05) 0%, rgba(255, 142, 83, 0.05) 100%)',
                      '&:hover': canSend ? {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(254, 107, 139, 0.2)',
                        background: 'linear-gradient(135deg, rgba(254, 107, 139, 0.1) 0%, rgba(255, 142, 83, 0.1) 100%)',
                      } : {},
                    }}
                    onClick={canSend ? () => router.push('/messages/sent') : undefined}
                  >
                    <Outbox
                      sx={{
                        fontSize: 40,
                        mb: 1,
                        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    />
                    {loadingCounts ? (
                      <CircularProgress size={24} sx={{ my: 1 }} />
                    ) : (
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 'bold',
                          background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {sentCount}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
                      {t('userDashboard.messagesSent')}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>

            {/* Discover Users Button */}
            <Paper
              elevation={12}
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 8px 32px rgba(254, 107, 139, 0.1)',
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {t('discoverUsers.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t('discoverUsers.description')}
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<Explore />}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                  boxShadow: '0 4px 15px rgba(254, 107, 139, 0.3)',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #FE6B8B 40%, #FF8E53 100%)',
                    boxShadow: '0 6px 20px rgba(254, 107, 139, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                }}
                onClick={() => router.push('/discover')}
              >
                {t('discoverUsers.button')}
              </Button>
            </Paper>
          </>
        )}

        {/* Send Message Dialog */}
        <SendMessageForm
          open={sendMessageOpen}
          onClose={() => setSendMessageOpen(false)}
          onSuccess={() => {
            // Refresh counts after sending a message
            refetchStats();
          }}
        />
      </Container>
    </Box>
  );
}
