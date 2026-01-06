'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper
} from '@mui/material';
import { Send, Inbox, Outbox } from '@mui/icons-material';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';
import SendMessageForm from '@/components/messages/SendMessageForm';
import { getReceivedMessages, getSentMessages } from '@/lib/messages-api';

export default function HomePage() {
  const { user, canSend, canReceive } = useAuth();
  const router = useRouter();
  const t = useTranslations('home');
  const [sendMessageOpen, setSendMessageOpen] = useState(false);
  const [receivedCount, setReceivedCount] = useState(0);
  const [sentCount, setSentCount] = useState(0);

  useEffect(() => {
    if (user) {
      // Fetch message counts based on role
      if (canReceive) {
        getReceivedMessages().then((res) => {
          if (res.success && res.data) {
            setReceivedCount(res.data.length);
          }
        });
      }
      if (canSend) {
        getSentMessages().then((res) => {
          if (res.success && res.data) {
            setSentCount(res.data.length);
          }
        });
      }
    }
  }, [user, canSend, canReceive]);

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
              ? t('welcomeUser', { name: user.displayName || user.email || 'User' })
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
                <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Inbox sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" color="primary">
                    {receivedCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('userDashboard.messagesReceived')}
                  </Typography>
                </Box>
              )}
              {canSend && (
                <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Outbox sx={{ fontSize: 32, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="h4" color="secondary">
                    {sentCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('userDashboard.messagesSent')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        )}

        {/* Send Message Dialog */}
        <SendMessageForm
          open={sendMessageOpen}
          onClose={() => setSendMessageOpen(false)}
        />
      </Container>
    </Box>
  );
}
