'use client';

import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Paper
} from '@mui/material';
import { Redeem, Favorite, Groups } from '@mui/icons-material';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';
import { useEventTypes } from '@/hooks/useEventTypes';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations('home');
  const { eventTypes, loading: eventsLoading, error: eventsError } = useEventTypes();

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
        </Box>

        {/* Section Fonctionnalités */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 4, 
          mb: 6 
        }}>
          <Box sx={{ flex: 1 }}>
            <Card 
              sx={{ 
                height: '100%', 
                textAlign: 'center',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-5px)' }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Redeem sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {t('features.manage.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('features.manage.description')}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Card 
              sx={{ 
                height: '100%', 
                textAlign: 'center',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-5px)' }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Favorite sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {t('features.discover.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('features.discover.description')}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Card 
              sx={{ 
                height: '100%', 
                textAlign: 'center',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-5px)' }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Groups sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {t('features.share.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('features.share.description')}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {user && (
          <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'background.default' }}>
            <Typography variant="h6" gutterBottom>
              {t('userDashboard.title')}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              gap: 3, 
              mt: 2,
              justifyContent: 'space-around' 
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Planned Gifts
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="secondary">
                  0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Created Lists
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Connected Friends
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}

        {/* TEMP: Event Types Test */}
        <Paper sx={{ p: 4, mt: 4, backgroundColor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom>
            🧪 TEST: Event Types from API
          </Typography>
          {eventsLoading && <Typography>Loading events...</Typography>}
          {eventsError && <Typography color="error">Error: {eventsError}</Typography>}
          {!eventsLoading && !eventsError && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {eventTypes.map((event) => (
                <Box
                  key={event.id}
                  sx={{
                    p: 1,
                    border: '1px solid #ddd',
                    borderRadius: 2,
                    backgroundColor: 'white',
                  }}
                >
                  <Typography variant="body2">
                    {event.icon} {event.name}
                  </Typography>
                </Box>
              ))}
              {eventTypes.length === 0 && (
                <Typography color="text.secondary">No events found</Typography>
              )}
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
