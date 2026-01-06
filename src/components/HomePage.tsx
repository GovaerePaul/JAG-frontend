'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import { Send, Inbox, Outbox, EmojiEvents } from '@mui/icons-material';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';
import SendMessageForm from '@/components/messages/SendMessageForm';
import authApiClient from '@/lib/api-client';
import { UserStats } from '@/lib/types';

interface MessageCounts {
  messagesSentCount: number;
  messagesReceivedCount: number;
}

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
  const [sendMessageOpen, setSendMessageOpen] = useState(false);
  const [messageCounts, setMessageCounts] = useState<MessageCounts>({
    messagesSentCount: 0,
    messagesReceivedCount: 0,
  });
  const [loadingCounts, setLoadingCounts] = useState(false);

  // Use userProfile from useAuth for gamification (auto-updates via onSnapshot)
  const gamification: GamificationData = {
    points: userProfile?.points ?? 0,
    level: userProfile?.level ?? 1,
    totalPointsEarned: userProfile?.totalPointsEarned ?? 0,
  };

  const fetchCounts = useCallback(async () => {
    if (!user) {
      setMessageCounts({ messagesSentCount: 0, messagesReceivedCount: 0 });
      return;
    }

    setLoadingCounts(true);
    try {
      const response = await authApiClient.getUserStats();
      if (response.success && response.data) {
        const stats = response.data as UserStats;
        setMessageCounts({
          messagesSentCount: stats.messagesSentCount ?? 0,
          messagesReceivedCount: stats.messagesReceivedCount ?? 0,
        });
      } else {
        console.error('Failed to fetch stats:', response.error);
      }
    } catch (error) {
      console.error('Error fetching message counts:', error);
    } finally {
      setLoadingCounts(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const receivedCount = messageCounts.messagesReceivedCount;
  const sentCount = messageCounts.messagesSentCount;
  
  const currentLevelPoints = (gamification.level - 1) * 100;
  const nextLevelPoints = gamification.level * 100;
  const pointsInCurrentLevel = gamification.points - currentLevelPoints;
  const pointsNeededForNextLevel = nextLevelPoints - gamification.points;
  const progressPercentage = (pointsInCurrentLevel / 100) * 100;

  return (
    <Box sx={{ py: 4 }}>
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
              textFillColor: 'transparent',
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
              ? t('welcomeUser', { name: user.displayName || user.email || tCommon('user') })
              : t('subtitle')
            }
          </Typography>
          {!user && (
            <Button
              variant="contained"
              size="large"
              sx={{ borderRadius: 3, px: 4, py: 1.5 }}
              onClick={() => router.push('/auth')}
            >
              {t('getStarted')}
            </Button>
          )}
          {user && (
            <Button
              variant="contained"
              size="large"
              startIcon={<Send />}
              sx={{ borderRadius: 3, px: 4, py: 1.5 }}
              onClick={() => setSendMessageOpen(true)}
            >
              {t('sendMessage')}
            </Button>
          )}
        </Box>

        {user && (
          <>
            <Paper sx={{ p: 4, mb: 3, backgroundColor: 'background.default' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                <EmojiEvents sx={{ fontSize: 40, color: 'warning.main' }} />
                <Box>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    {tGamification('level')} {gamification.level}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {gamification.points} {tGamification('points')}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {tGamification('progress')}: {pointsInCurrentLevel}/100
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {tGamification('nextLevel')}: {pointsNeededForNextLevel} {tGamification('points')}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progressPercentage} 
                  sx={{ height: 8, borderRadius: 4 }}
                  color="warning"
                />
              </Box>
            </Paper>

            <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'background.default' }}>
              <Typography variant="h6" gutterBottom>
                {t('userDashboard.title')}
              </Typography>
              <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 4,
                mt: 2,
                justifyContent: 'center'
              }}>
              {canReceive && (
                <Box
                  sx={{
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, opacity 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      opacity: 0.8,
                    },
                  }}
                  onClick={() => router.push('/messages/received')}
                >
                  <Inbox sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                  {loadingCounts ? (
                    <CircularProgress size={24} sx={{ my: 1 }} />
                  ) : (
                    <Typography variant="h4" color="primary">
                      {receivedCount}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {t('userDashboard.messagesReceived')}
                  </Typography>
                </Box>
              )}
              {canSend && (
                <Box
                  sx={{
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, opacity 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      opacity: 0.8,
                    },
                  }}
                  onClick={() => router.push('/messages/sent')}
                >
                  <Outbox sx={{ fontSize: 32, color: 'secondary.main', mb: 1 }} />
                  {loadingCounts ? (
                    <CircularProgress size={24} sx={{ my: 1 }} />
                  ) : (
                    <Typography variant="h4" color="secondary">
                      {sentCount}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {t('userDashboard.messagesSent')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
          </>
        )}

        {/* Send Message Dialog */}
        <SendMessageForm
          open={sendMessageOpen}
          onClose={() => setSendMessageOpen(false)}
          onSuccess={() => {
            // Refresh counts after sending a message
            fetchCounts();
          }}
        />
      </Container>
    </Box>
  );
}
