'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import {
  Container,
  Paper,
  Box,
  Typography,
  Avatar,
  Grid,
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
} from '@mui/icons-material';
import { useRouter } from '@/i18n/navigation';
import authApiClient from '@/lib/api-client';
import { UserStats } from '@/lib/types';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import NotificationBadge from '@/components/NotificationBadge';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tGamification = useTranslations('gamification');
  const tHome = useTranslations('home');
  const { user, userProfile, loading, canSend, canReceive } = useAuth();
  const router = useRouter();
  const { unreadCount } = useUnreadMessages();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedName, setEditedName] = useState(user?.displayName || '');
  const [messageCounts, setMessageCounts] = useState({
    messagesSentCount: 0,
    messagesReceivedCount: 0,
  });
  const [loadingCounts, setLoadingCounts] = useState(false);

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
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              {user.emailVerified && (
                <Chip 
                  icon={<Verified />} 
                  label={t('emailVerified')} 
                  color="success" 
                  size="small" 
                />
              )}
              <Chip 
                label={user.providerData[0]?.providerId || 'email'} 
                variant="outlined" 
                size="small" 
              />
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

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
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
          </Grid>

          <Grid item xs={12} md={6}>
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
          </Grid>

          {/* Message Statistics */}
          <Grid item xs={12}>
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
          </Grid>
        </Grid>
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
