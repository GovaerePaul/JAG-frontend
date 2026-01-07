'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth, UserPreferences } from '@/hooks/useAuth';
import {
  Container,
  Paper,
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  Person,
  Email,
  CalendarToday,
  Security,
  Verified,
  Edit,
  Save,
  Cancel,
  EmojiEvents,
  Inbox,
  Outbox,
  Favorite,
  FavoriteBorder,
  Add,
} from '@mui/icons-material';
import { useRouter } from '@/i18n/navigation';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { useUserStats } from '@/hooks/useUserStats';
import { useEventTypes } from '@/hooks/useEventTypes';
import { updateUserPreferences } from '@/lib/users-api';
import NotificationBadge from '@/components/NotificationBadge';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tGamification = useTranslations('gamification');
  const tHome = useTranslations('home');
  const { user, userProfile, loading, canSend, canReceive } = useAuth();
  const router = useRouter();
  const { unreadCount } = useUnreadMessages();
  const { messageCounts, loading: loadingCounts } = useUserStats();
  const { eventTypes, loading: loadingEventTypes } = useEventTypes();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedName, setEditedName] = useState(user?.displayName || '');
  const [savingPreferences, setSavingPreferences] = useState(false);

  // Use userProfile from useAuth for gamification (auto-updates via onSnapshot)
  const gamification = {
    points: userProfile?.points ?? 0,
    level: userProfile?.level ?? 1,
    totalPointsEarned: userProfile?.totalPointsEarned ?? 0,
  };

  if (!user) {
    return null;
  }

  const handleEditProfile = () => {
    setEditedName(user.displayName || '');
    setEditDialogOpen(true);
  };

  const handleSaveProfile = () => {
    // TODO: Implement profile update logic
    setEditDialogOpen(false);
  };

  const handleCancelEdit = () => {
    setEditedName(user.displayName || '');
    setEditDialogOpen(false);
  };

  const handleUpdatePreferences = async (preferences: Partial<UserPreferences>) => {
    setSavingPreferences(true);
    try {
      const response = await updateUserPreferences(preferences);
      if (!response.success) {
        console.error('Failed to update preferences:', response.error);
        // TODO: Show error toast/notification
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      // TODO: Show error toast/notification
    } finally {
      setSavingPreferences(false);
    }
  };

  const getAccountAge = () => {
    if (!user.metadata?.creationTime) return t('unknown');
    const creationDate = new Date(user.metadata.creationTime);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - creationDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    }
  };

  const getLastSignIn = () => {
    if (!user.metadata?.lastSignInTime) return t('never');
    return new Date(user.metadata.lastSignInTime).toLocaleDateString();
  };

  const currentLevelPoints = (gamification.level - 1) * 100;
  const nextLevelPoints = gamification.level * 100;
  const pointsInCurrentLevel = gamification.points - currentLevelPoints;
  const pointsNeededForNextLevel = nextLevelPoints - gamification.points;
  const progressPercentage = (pointsInCurrentLevel / 100) * 100;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            src={user.photoURL || undefined}
            sx={{ 
              width: 100, 
              height: 100, 
              mr: 3,
              fontSize: '2rem'
            }}
          >
            {user.displayName?.charAt(0) || user.email?.charAt(0)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" gutterBottom>
              {user.displayName || t('noDisplayName')}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {user.email}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              {user.emailVerified && (
                <Chip 
                  icon={<Verified />} 
                  label={t('emailVerified')} 
                  color="success" 
                  size="small" 
                />
              )}
              {/* Favorite Event Types for Receiving */}
              {userProfile?.preferences?.favoriteEventTypeIdsForReceiving &&
                userProfile.preferences.favoriteEventTypeIdsForReceiving.length > 0 &&
                userProfile.preferences.favoriteEventTypeIdsForReceiving.map((eventTypeId) => {
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
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  );
                })}
              {(!userProfile?.preferences?.favoriteEventTypeIdsForReceiving ||
                userProfile.preferences.favoriteEventTypeIdsForReceiving.length === 0) && (
                <Chip
                  label={t('noFavoritesForReceiving')}
                  variant="outlined"
                  size="small"
                  color="default"
                />
              )}
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={handleEditProfile}
          >
            {t('editProfile')}
          </Button>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Card elevation={2} sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <EmojiEvents sx={{ fontSize: 48, color: 'warning.main' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                  {tGamification('level')} {gamification.level}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {gamification.points} {tGamification('points')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {tGamification('totalEarned')}: {gamification.totalPointsEarned} {tGamification('points')}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {tGamification('progress')}: {pointsInCurrentLevel}/100
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tGamification('nextLevel')}: {pointsNeededForNextLevel} {tGamification('points')}
                </Typography>
              </Box>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <LinearProgress 
                  variant="determinate" 
                  value={progressPercentage} 
                  sx={{ height: 10, borderRadius: 5 }}
                  color="warning"
                />
              )}
            </Box>
          </CardContent>
        </Card>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
            },
            gap: 4,
          }}
        >
          <Box>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  {t('accountInformation')}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('displayName')}
                      secondary={user.displayName || t('notSet')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Email />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('emailAddress')}
                      secondary={user.email}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('memberSince')}
                      secondary={user.metadata?.creationTime ? 
                        new Date(user.metadata.creationTime).toLocaleDateString() : 
                        t('unknown')
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  {t('accountSecurity')}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Security />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('accountAgeLabel')}
                      secondary={getAccountAge()}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Verified />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('emailVerification')}
                      secondary={user.emailVerified ? t('verified') : t('notVerified')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('lastSignIn')}
                      secondary={getLastSignIn()}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>

          {/* Message Statistics */}
          <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  {tHome('userDashboard.title')}
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
                      <NotificationBadge count={unreadCount} pulse={unreadCount > 0}>
                        <Inbox sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                      </NotificationBadge>
                      {loadingCounts ? (
                        <CircularProgress size={24} sx={{ my: 1 }} />
                      ) : (
                        <Typography variant="h4" color="primary">
                          {messageCounts.messagesReceivedCount}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {tHome('userDashboard.messagesReceived')}
                      </Typography>
                      {unreadCount > 0 && (
                        <Typography
                          variant="caption"
                          sx={{
                            mt: 0.5,
                            color: 'error.main',
                            fontWeight: 'bold',
                            fontSize: '0.75rem',
                          }}
                        >
                          {unreadCount} {unreadCount === 1 ? tHome('userDashboard.newMessage') : tHome('userDashboard.newMessages')}
                        </Typography>
                      )}
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
                          {messageCounts.messagesSentCount}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {tHome('userDashboard.messagesSent')}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Event Preferences */}
          <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  {t('eventPreferences')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {t('eventPreferencesDescription')}
                </Typography>

                {loadingEventTypes ? (
                  <CircularProgress />
                ) : (
                  <>
                    {/* Favorites for Receiving */}
                    {canReceive && (
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                          {t('favoritesForReceiving')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {t('favoritesForReceivingDescription')}
                        </Typography>

                        {/* Current Favorites for Receiving */}
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
                                        handleUpdatePreferences({
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

                        {/* Available Event Types to Add */}
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
                              (et) =>
                                !userProfile?.preferences?.favoriteEventTypeIdsForReceiving?.includes(et.id)
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
                                      handleUpdatePreferences({
                                        favoriteEventTypeIdsForReceiving: newFavorites,
                                      });
                                    }}
                                    disabled={savingPreferences}
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

                    {/* Favorites for Sending */}
                    {canSend && (
                      <Box>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                          {t('favoritesForSending')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {t('favoritesForSendingDescription')}
                        </Typography>

                        {/* All Event Types - checked by default, user can uncheck */}
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
                                      handleUpdatePreferences({
                                        favoriteEventTypeIdsForSending: newFavorites,
                                      });
                                    }}
                                    color="primary"
                                    variant="contained"
                                    disabled={savingPreferences}
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
                                      handleUpdatePreferences({
                                        favoriteEventTypeIdsForSending: newFavorites,
                                      });
                                    }}
                                    variant="outlined"
                                    disabled={savingPreferences}
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
                  </>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Paper>

      <Dialog open={editDialogOpen} onClose={handleCancelEdit} maxWidth="sm" fullWidth>
        <DialogTitle>{t('editProfile')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('displayName')}
            fullWidth
            variant="outlined"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit} startIcon={<Cancel />}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSaveProfile} variant="contained" startIcon={<Save />}>
            {t('save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
