'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Container, Box, Divider, TextField, Button } from '@mui/material';
import { Edit, Save, Cancel, LocationOn } from '@mui/icons-material';
import { useRouter } from '@/i18n/navigation';
import { updateUserPreferences } from '@/lib/users-api';
import { useAuth } from '@/features/auth/useAuth';
import { useUnreadMessages } from '@/features/messages/useUnreadMessages';
import { useUserStats } from '@/features/user/useUserStats';
import { useEventTypes } from '@/features/events/useEventTypes';
import type { UserPreferences } from '@/types/auth';
import StyledPaper from '@/components/ui/StyledPaper';
import GradientButton from '@/components/ui/GradientButton';
import GamificationCard from '@/components/gamification/GamificationCard';
import UserDashboardCard from '@/components/dashboard/UserDashboardCard';
import ProfileHeader from '@/components/profile/ProfileHeader';
import PhotoUploadDialog from '@/components/profile/PhotoUploadDialog';
import LocationDialog from '@/components/profile/LocationDialog';
import EventPreferencesSection from '@/components/profile/EventPreferencesSection';
import AccountInfoCard from '@/components/profile/AccountInfoCard';
import SecurityInfoCard from '@/components/profile/SecurityInfoCard';
import InfoCard from '@/components/ui/InfoCard';
import BaseDialog from '@/components/dialogs/BaseDialog';

export default function ProfilePage() {
  const { user, userProfile, canReceive } = useAuth();
  const { unreadCount } = useUnreadMessages();
  const { messageCounts } = useUserStats();
  const { eventTypes, loading } = useEventTypes();

  const t = useTranslations('profile');

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedName, setEditedName] = useState(user?.displayName || '');
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [currentPhotoURL, setCurrentPhotoURL] = useState<string | null>(null);

  useEffect(() => {
    if (user?.photoURL) {
      setCurrentPhotoURL(user.photoURL);
    } else {
      setCurrentPhotoURL(null);
    }
  }, [user?.photoURL]);

  useEffect(() => {
    if (user?.displayName) {
      setEditedName(user.displayName);
    }
  }, [user?.displayName]);

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
    // TODO: Implement save profile name
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
    } catch (_error) {
      // Silent fail
    } finally {
      setSavingPreferences(false);
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
        <StyledPaper sx={{ p: 4 }}>
          <ProfileHeader
            user={user}
            userProfile={userProfile}
            eventTypes={eventTypes}
            currentPhotoURL={currentPhotoURL}
            onEditPhoto={() => setPhotoDialogOpen(true)}
            onEditProfile={handleEditProfile}
          />

          <Divider sx={{ mb: 4, borderColor: 'rgba(254, 107, 139, 0.2)' }} />

          <GamificationCard
            level={gamification.level}
            points={gamification.points}
            totalPointsEarned={gamification.totalPointsEarned}
            loading={loading}
          />

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
              mb: 4,
            }}
          >
            <AccountInfoCard user={user} />
            <SecurityInfoCard user={user} />
          </Box>

          <Box sx={{ mb: 4 }}>
            <InfoCard
              title={t('location.title') || 'Localisation'}
              actionButton={{
                label: t('location.edit') || 'Modifier',
                onClick: () => {
                  setLocationDialogOpen(true);
                },
                icon: <Edit />,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <LocationOn sx={{ color: '#FE6B8B' }} />
                <span>{getLocationDisplay()}</span>
              </Box>
            </InfoCard>
          </Box>

          <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' }, mb: 4 }}>
            <UserDashboardCard
              canReceive={canReceive}
              canSend={canSend}
              unreadCount={unreadCount}
              messageCounts={messageCounts}
              showTitle={true}
            />
          </Box>

          <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
            <EventPreferencesSection
              userProfile={userProfile}
              eventTypes={eventTypes}
              canReceive={canReceive}
              canSend={canSend}
              onPreferencesUpdate={handleUpdatePreferences}
              saving={savingPreferences}
            />
          </Box>
        </StyledPaper>

        {/* Edit Profile Dialog */}
        <BaseDialog
          open={editDialogOpen}
          onClose={handleCancelEdit}
          title={t('editProfile')}
          maxWidth="sm"
          fullWidth
          actions={
            <>
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
              <GradientButton onClick={handleSaveProfile} startIcon={<Save />}>
                {t('save')}
              </GradientButton>
            </>
          }
        >
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
        </BaseDialog>

        <PhotoUploadDialog
          open={photoDialogOpen}
          onClose={() => setPhotoDialogOpen(false)}
          user={user}
          currentPhotoURL={currentPhotoURL}
          onPhotoUpdated={(newPhotoURL) => {
            setCurrentPhotoURL(newPhotoURL);
          }}
        />

        <LocationDialog
          open={locationDialogOpen}
          onClose={() => setLocationDialogOpen(false)}
          currentLocation={getLocationDisplay()}
          onLocationUpdated={() => {
            // Location will update when profile is refetched
          }}
        />
      </Container>
    </Box>
  );
}
