'use client';

import { Box, Typography, Avatar, Button, Chip, IconButton } from '@mui/material';
import { Edit, CameraAlt, Verified } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { User } from 'firebase/auth';
import type { UserProfile } from '@/types/auth';
import type { EventType } from '@/types/events';
import { getUserEmail } from '@/lib/userUtils';
import GradientTypography from '@/components/ui/GradientTypography';

interface ProfileHeaderProps {
  user: User;
  userProfile: UserProfile | null;
  eventTypes: EventType[];
  currentPhotoURL: string | null;
  onEditPhoto: () => void;
  onEditProfile: () => void;
}

export default function ProfileHeader({
  user,
  userProfile,
  eventTypes,
  currentPhotoURL,
  onEditPhoto,
  onEditProfile,
}: ProfileHeaderProps) {
  const t = useTranslations('profile');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 4,
        position: 'relative',
        zIndex: 1,
        gap: { xs: 2, sm: 0 },
      }}
    >
      <Box sx={{ position: 'relative', alignSelf: { xs: 'center', sm: 'flex-start' } }}>
        <Avatar
          src={currentPhotoURL || user.photoURL || undefined}
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
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.9,
            },
          }}
          onClick={onEditPhoto}
        >
          {user.displayName?.charAt(0) || getUserEmail(user)?.charAt(0)}
        </Avatar>
        <IconButton
          onClick={onEditPhoto}
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
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover': {
              backgroundColor: '#FF8E53',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.3s ease',
          }}
          aria-label={t('changePhoto')}
        >
          <CameraAlt sx={{ fontSize: { xs: 18, sm: 20 } }} />
        </IconButton>
        <IconButton
          onClick={onEditProfile}
          sx={{
            position: 'absolute',
            top: 0,
            right: { xs: 0, sm: -8 },
            backgroundColor: '#FF8E53',
            color: 'white',
            width: { xs: 32, sm: 36 },
            height: { xs: 32, sm: 36 },
            border: '3px solid white',
            boxShadow: '0 2px 8px rgba(254, 107, 139, 0.3)',
            display: { xs: 'flex', sm: 'none' },
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover': {
              backgroundColor: '#FE6B8B',
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
        <GradientTypography
          variant="h4"
          gutterBottom
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
        >
          {user.displayName || t('noDisplayName')}
        </GradientTypography>
        <Typography variant="body1" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          {getUserEmail(user)}
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
      <Button
        variant="outlined"
        startIcon={<Edit />}
        onClick={onEditProfile}
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
  );
}
