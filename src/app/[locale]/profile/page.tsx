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
  Inbox,
  Outbox,
  Favorite,
  FavoriteBorder,
  Add,
  LocationOn,
} from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useRouter } from '@/i18n/navigation';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { useUserStats } from '@/hooks/useUserStats';
import { useEventTypes } from '@/hooks/useEventTypes';
import { updateUserPreferences, updateUserLocationByCity } from '@/lib/users-api';
import { useQuests } from '@/hooks/useQuests';
import NotificationBadge from '@/components/NotificationBadge';
import CityAutocomplete from '@/components/discover/CityAutocomplete';
import { Alert } from '@mui/material';
import LevelIcon from '@/components/LevelIcon';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tGamification = useTranslations('gamification');
  const tHome = useTranslations('home');
  const { user, userProfile, loading, canSend, canReceive } = useAuth();
  const router = useRouter();
  const { unreadCount } = useUnreadMessages();
  const { messageCounts, loading: loadingCounts } = useUserStats();
  const { eventTypes, loading: loadingEventTypes } = useEventTypes();
  const { refetch: refetchQuests } = useQuests();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedName, setEditedName] = useState(user?.displayName || '');
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [locationCity, setLocationCity] = useState('');
  const [selectedLocationCity, setSelectedLocationCity] = useState<{
    city: string;
    region?: string;
    country?: string;
  } | null>(null);
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

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
        // Silent fail
      }
    } catch (error) {
      // Silent fail
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleUpdateLocation = async () => {
    if (!selectedLocationCity || !selectedLocationCity.city.trim()) {
      setLocationError(t('location.cityRequired') || 'Veuillez sélectionner une ville');
      return;
    }

    setUpdatingLocation(true);
    setLocationError(null);

    try {
      const response = await updateUserLocationByCity(selectedLocationCity.city);
      if (response.success) {
        setLocationDialogOpen(false);
        setLocationCity('');
        setSelectedLocationCity(null);
        // The userProfile will update automatically via onSnapshot
      } else {
        setLocationError(response.error || t('location.error') || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      setLocationError(err instanceof Error ? err.message : t('location.error') || 'Erreur lors de la mise à jour');
    } finally {
      setUpdatingLocation(false);
    }
  };

  const getLocationDisplay = () => {
    if (!userProfile?.location?.city) {
      return t('location.notSet') || 'Non définie';
    }
    const parts = [userProfile.location.city];
    if (userProfile.location.region) parts.push(userProfile.location.region);
    if (userProfile.location.country) parts.push(userProfile.location.country);
    return parts.join(', ');
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
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        py: 4,
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
        <Paper
          elevation={12}
          sx={{
            p: 4,
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
              top: -100,
              right: -100,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(254, 107, 139, 0.08) 0%, rgba(255, 142, 83, 0.08) 100%)',
              filter: 'blur(50px)',
            },
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, mb: 4, position: 'relative', zIndex: 1, gap: { xs: 2, sm: 0 } }}>
            <Box sx={{ position: 'relative', alignSelf: { xs: 'center', sm: 'flex-start' } }}>
              <Avatar
                src={user.photoURL || undefined}
                sx={{
                  width: { xs: 80, sm: 120 },
                  height: { xs: 80, sm: 120 },
                  mr: { xs: 0, sm: 3 },
                  mb: { xs: 0, sm: 0 },
                  fontSize: { xs: '2rem', sm: '2.5rem' },
                  border: '4px solid',
                  borderColor: 'transparent',
                  background: 'linear-gradient(135deg, #FE6B8B, #FF8E53)',
                  backgroundClip: 'padding-box',
                  boxShadow: '0 4px 20px rgba(254, 107, 139, 0.3)',
                }}
              >
                {user.displayName?.charAt(0) || user.email?.charAt(0)}
              </Avatar>
              {/* Icon Edit on mobile only */}
              <IconButton
                onClick={handleEditProfile}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: { xs: 0, sm: -8 },
                  backgroundColor: '#FE6B8B',
                  color: 'white',
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  border: '3px solid white',
                  boxShadow: '0 2px 8px rgba(254, 107, 139, 0.3)',
                  display: { xs: 'flex', sm: 'none' },
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': {
                    backgroundColor: '#FF8E53',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
                aria-label={t('editProfile')}
              >
                <Edit sx={{ fontSize: { xs: 18, sm: 20 } }} />
              </IconButton>
            </Box>
            <Box sx={{ flexGrow: 1, width: { xs: '100%', sm: 'auto' }, textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {user.displayName || t('noDisplayName')}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                {user.email}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                {user.emailVerified && (
                  <Chip
                    icon={<Verified />}
                    label={t('emailVerified')}
                    color="success"
                    size="small"
                    sx={{ fontWeight: 500 }}
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
                        sx={{
                          borderColor: '#FE6B8B',
                          color: '#FE6B8B',
                          fontWeight: 500,
                        }}
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
            {/* Button Edit on desktop only */}
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={handleEditProfile}
              sx={{
                display: { xs: 'none', sm: 'flex' },
                borderColor: '#FE6B8B',
                color: '#FE6B8B',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#FE6B8B',
                  background: 'rgba(254, 107, 139, 0.08)',
                },
              }}
            >
              {t('editProfile')}
            </Button>
          </Box>

          <Divider sx={{ mb: 4, borderColor: 'rgba(254, 107, 139, 0.2)' }} />

          <Card
            elevation={0}
            sx={{
              mb: 4,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(254, 107, 139, 0.05) 0%, rgba(255, 142, 83, 0.05) 100%)',
              border: '1px solid rgba(254, 107, 139, 0.1)',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
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
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {tGamification('progress')}: {pointsInCurrentLevel}/100
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {tGamification('nextLevel')}: {pointsNeededForNextLevel} {tGamification('points')}
                  </Typography>
                </Box>
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
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
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Box>
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

          {/* Location Card */}
          <Box>
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
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {t('location.title') || 'Localisation'}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => {
                      setLocationCity(getLocationDisplay());
                      setSelectedLocationCity(null);
                      setLocationError(null);
                      setLocationDialogOpen(true);
                    }}
                    sx={{
                      borderColor: '#FE6B8B',
                      color: '#FE6B8B',
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: '#FE6B8B',
                        background: 'rgba(254, 107, 139, 0.08)',
                      },
                    }}
                  >
                    {t('location.edit') || 'Modifier'}
                  </Button>
                </Box>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <LocationOn sx={{ color: '#FE6B8B' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('location.current') || 'Ville actuelle'}
                      secondary={getLocationDisplay()}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>

            {/* Message Statistics */}
            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
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
            <Button
              onClick={handleCancelEdit}
              startIcon={<Cancel />}
              sx={{
                textTransform: 'none',
                color: 'text.secondary',
              }}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleSaveProfile}
              variant="contained"
              startIcon={<Save />}
              sx={{
                textTransform: 'none',
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                boxShadow: '0 4px 15px rgba(254, 107, 139, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FE6B8B 40%, #FF8E53 100%)',
                  boxShadow: '0 6px 20px rgba(254, 107, 139, 0.4)',
                },
              }}
            >
              {t('save')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Location Edit Dialog */}
        <Dialog open={locationDialogOpen} onClose={() => setLocationDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn sx={{ color: '#FE6B8B' }} />
            <Typography
              sx={{
                fontWeight: 600,
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('location.editTitle') || 'Modifier la localisation'}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              {locationError && (
                <Alert
                  severity="error"
                  onClose={() => setLocationError(null)}
                  sx={{
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      color: '#FE6B8B',
                    },
                  }}
                >
                  {locationError}
                </Alert>
              )}

              <Typography variant="body2" color="text.secondary">
                {t('location.description') || 'Sélectionnez votre ville pour permettre aux autres utilisateurs de vous trouver.'}
              </Typography>
              
              <CityAutocomplete
                value={locationCity}
                onChange={(value) => setLocationCity(value || '')}
                onSelect={(cityData) => {
                  setSelectedLocationCity(cityData);
                  const parts = [cityData.city];
                  if (cityData.region) parts.push(cityData.region);
                  if (cityData.country) parts.push(cityData.country);
                  setLocationCity(parts.join(', '));
                  setLocationError(null);
                }}
                disabled={updatingLocation}
                error={!!locationError && !locationCity.trim()}
                helperText={locationError && !locationCity.trim() ? locationError : undefined}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => {
                setLocationDialogOpen(false);
                setLocationCity('');
                setSelectedLocationCity(null);
                setLocationError(null);
              }}
              disabled={updatingLocation}
              sx={{
                textTransform: 'none',
                color: 'text.secondary',
              }}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdateLocation}
              disabled={updatingLocation || !selectedLocationCity || !selectedLocationCity.city.trim()}
              startIcon={updatingLocation ? <CircularProgress size={20} /> : <Save />}
              sx={{
                textTransform: 'none',
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                boxShadow: '0 4px 15px rgba(254, 107, 139, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FE6B8B 40%, #FF8E53 100%)',
                  boxShadow: '0 6px 20px rgba(254, 107, 139, 0.4)',
                },
                '&:disabled': {
                  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                  opacity: 0.6,
                },
              }}
            >
              {updatingLocation ? (t('common.loading') || 'Chargement...') : (t('save') || 'Enregistrer')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
