'use client';

import { Box, Typography, Button, Chip, Card, CardContent } from '@mui/material';
import { Add, Favorite, FavoriteBorder } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { UserProfile } from '@/hooks/useAuth';
import { UserPreferences } from '@/hooks/useAuth';
import { EventType } from '@/lib/events-api';
import GradientTypography from '@/components/ui/GradientTypography';

interface EventPreferencesSectionProps {
  userProfile: UserProfile | null;
  eventTypes: EventType[];
  canReceive: boolean;
  canSend: boolean;
  onPreferencesUpdate: (preferences: Partial<UserPreferences>) => void;
  saving: boolean;
}

export default function EventPreferencesSection({
  userProfile,
  eventTypes,
  canReceive,
  canSend,
  onPreferencesUpdate,
  saving,
}: EventPreferencesSectionProps) {
  const t = useTranslations('profile');

  if (eventTypes.length === 0) {
    return null;
  }

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.7)',
        border: '1px solid rgba(254, 107, 139, 0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(254, 107, 139, 0.15)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent>
        <GradientTypography variant="h6" gutterBottom>
          {t('eventPreferences')}
        </GradientTypography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('eventPreferencesDescription')}
        </Typography>

        {canReceive && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              {t('favoritesForReceiving')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('favoritesForReceivingDescription')}
            </Typography>

            {userProfile?.preferences?.favoriteEventTypeIdsForReceiving &&
              userProfile.preferences.favoriteEventTypeIdsForReceiving.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('currentFavorites')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {userProfile.preferences.favoriteEventTypeIdsForReceiving.map((eventTypeId) => {
                      const eventType = eventTypes.find((et) => et.id === eventTypeId);
                      if (!eventType) return null;
                      return (
                        <Chip
                          key={eventTypeId}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <span>{eventType.icon}</span>
                              <span>{eventType.name}</span>
                            </Box>
                          }
                          onDelete={() => {
                            const newFavorites =
                              userProfile?.preferences?.favoriteEventTypeIdsForReceiving?.filter(
                                (id) => id !== eventTypeId
                              ) || [];
                            onPreferencesUpdate({
                              favoriteEventTypeIdsForReceiving: newFavorites,
                            });
                          }}
                          color="primary"
                          variant="outlined"
                        />
                      );
                    })}
                  </Box>
                </Box>
              )}

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 2,
              }}
            >
              {eventTypes
                .filter(
                  (et) => !userProfile?.preferences?.favoriteEventTypeIdsForReceiving?.includes(et.id)
                )
                .map((eventType) => {
                  return (
                    <Box
                      key={eventType.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography component="span" sx={{ fontSize: '1.5rem' }}>
                          {eventType.icon}
                        </Typography>
                        <Typography variant="body2">{eventType.name}</Typography>
                      </Box>
                      <Button
                        size="small"
                        startIcon={<Add />}
                        onClick={() => {
                          const currentFavorites =
                            userProfile?.preferences?.favoriteEventTypeIdsForReceiving || [];
                          const newFavorites = [...currentFavorites, eventType.id];
                          onPreferencesUpdate({
                            favoriteEventTypeIdsForReceiving: newFavorites,
                          });
                        }}
                        disabled={saving}
                        variant="outlined"
                      >
                        {t('add')}
                      </Button>
                    </Box>
                  );
                })}
            </Box>
          </Box>
        )}

        {canSend && (
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              {t('favoritesForSending')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('favoritesForSendingDescription')}
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 2,
              }}
            >
              {eventTypes.map((eventType) => {
                // By default, all are enabled. If favoriteEventTypeIdsForSending exists, use it, otherwise all are enabled
                const isEnabled =
                  userProfile?.preferences?.favoriteEventTypeIdsForSending === undefined
                    ? true
                    : userProfile.preferences.favoriteEventTypeIdsForSending.includes(eventType.id);

                return (
                  <Box
                    key={eventType.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      bgcolor: isEnabled ? 'action.selected' : 'transparent',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography component="span" sx={{ fontSize: '1.5rem' }}>
                        {eventType.icon}
                      </Typography>
                      <Typography variant="body2">{eventType.name}</Typography>
                    </Box>
                    {isEnabled ? (
                      <Button
                        size="small"
                        startIcon={<Favorite />}
                        onClick={() => {
                          // Remove from favorites for sending
                          const currentFavorites =
                            userProfile?.preferences?.favoriteEventTypeIdsForSending ||
                            eventTypes.map((et) => et.id);
                          const newFavorites = currentFavorites.filter((id) => id !== eventType.id);
                          onPreferencesUpdate({
                            favoriteEventTypeIdsForSending: newFavorites,
                          });
                        }}
                        color="primary"
                        variant="contained"
                        disabled={saving}
                      >
                        {t('remove')}
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        startIcon={<FavoriteBorder />}
                        onClick={() => {
                          // Add back to favorites for sending
                          const currentFavorites =
                            userProfile?.preferences?.favoriteEventTypeIdsForSending || [];
                          const newFavorites = [...currentFavorites, eventType.id];
                          onPreferencesUpdate({
                            favoriteEventTypeIdsForSending: newFavorites,
                          });
                        }}
                        variant="outlined"
                        disabled={saving}
                      >
                        {t('add')}
                      </Button>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
