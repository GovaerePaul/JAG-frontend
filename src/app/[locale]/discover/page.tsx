'use client';

import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { FilterList } from '@mui/icons-material';
import { Explore } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import type { UserProfile } from '@/types/auth';
import { useDiscoverUsers } from '@/features/user/useDiscoverUsers';
import { useEventTypes } from '@/features/events/useEventTypes';
import type { DiscoverUsersFilters } from '@/types/users';
import UserCard from '@/components/discover/UserCard';
import DiscoverFilters from '@/components/discover/DiscoverFilters';
import LocationPermission from '@/components/discover/LocationPermission';
import SendMessageForm from '@/components/messages/SendMessageForm';

interface DiscoverPageProps {
  userProfile?: UserProfile | null;
}

export default function DiscoverPage({ userProfile = null }: DiscoverPageProps) {
  const t = useTranslations('discover');
  const { users, loading, error, currentDistance, isExpanding, search, loadMore } =
    useDiscoverUsers({
      initialDistance: 50,
      maxDistance: 500,
      autoExpand: true,
    });
  const { eventTypes } = useEventTypes();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<DiscoverUsersFilters>();
  const [locationPermissionOpen, setLocationPermissionOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (!userProfile || userProfile.preferences?.shareLocation === true) return false;
    const hasSeenPrompt = localStorage.getItem('discover_location_prompt_seen');
    if (!hasSeenPrompt) {
      localStorage.setItem('discover_location_prompt_seen', 'true');
      return true;
    }
    return false;
  });
  const [sendMessageOpen, setSendMessageOpen] = useState(false);
  const [selectedReceiverId, setSelectedReceiverId] = useState<string>();
  const [selectedReceiverName, setSelectedReceiverName] = useState<string>();

  const handleFiltersApply = (newFilters: DiscoverUsersFilters) => {
    setFilters(newFilters);
    search({ filters: newFilters });
  };

  const handleSendMessage = (userId: string, userName?: string) => {
    setSelectedReceiverId(userId);
    setSelectedReceiverName(userName);
    setSendMessageOpen(true);
  };

  const handleLocationEnabled = () => {
    search({ filters });
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
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('subtitle')}
          </Typography>
        </Box>

        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setFiltersOpen(true)}
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
            {t('filters')}
          </Button>
        </Box>

      {(isExpanding || currentDistance > 50) && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {isExpanding
            ? t('expanding', { current: currentDistance - 25, next: currentDistance })
            : t('searching', { distance: currentDistance })}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {loading && users.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : users.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 8,
            textAlign: 'center',
          }}
        >
          <Explore sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('noResults')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('searching', { distance: currentDistance })}
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('nearYou')}
            </Typography>
            {filters && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                {filters.maxDistance && (
                  <Chip
                    label={`${t('filterOptions.maxDistance', { distance: filters.maxDistance })}`}
                    size="small"
                    onDelete={() => {
                      const newFilters = { ...filters };
                      delete newFilters.maxDistance;
                      handleFiltersApply(newFilters);
                    }}
                  />
                )}
                {(filters.minAge || filters.maxAge) && (
                  <Chip
                    label={`Age: ${filters.minAge || '18'}-${filters.maxAge || '100'}`}
                    size="small"
                    onDelete={() => {
                      const newFilters = { ...filters };
                      delete newFilters.minAge;
                      delete newFilters.maxAge;
                      handleFiltersApply(newFilters);
                    }}
                  />
                )}
              </Box>
            )}
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 3,
            }}
          >
            {users.map((discoveredUser) => (
              <Box key={discoveredUser.user.uid}>
                <UserCard
                  user={discoveredUser}
                  eventTypes={eventTypes}
                  onSendMessage={(userId) =>
                    handleSendMessage(userId, discoveredUser.user.displayName)
                  }
                />
              </Box>
            ))}
          </Box>

          {users.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              {loading ? (
                <CircularProgress />
              ) : (
                <Button
                  variant="outlined"
                  onClick={loadMore}
                  disabled={loading}
                  sx={{
                    borderColor: '#FE6B8B',
                    color: '#FE6B8B',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 4,
                    '&:hover': {
                      borderColor: '#FE6B8B',
                      background: 'rgba(254, 107, 139, 0.08)',
                    },
                    '&:disabled': {
                      borderColor: 'rgba(254, 107, 139, 0.3)',
                      color: 'rgba(254, 107, 139, 0.3)',
                    },
                  }}
                >
                  Load More
                </Button>
              )}
            </Box>
          )}
        </>
      )}

      {filtersOpen && (
        <DiscoverFilters
          key={JSON.stringify(filters)}
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          onApply={handleFiltersApply}
          initialFilters={filters}
        />
      )}

      {locationPermissionOpen && (
        <LocationPermission
          open={locationPermissionOpen}
          onClose={() => setLocationPermissionOpen(false)}
          onLocationEnabled={handleLocationEnabled}
        />
      )}

      {sendMessageOpen && (
        <SendMessageForm
          key={`${sendMessageOpen}-${selectedReceiverId}`}
          open={sendMessageOpen}
          onClose={() => {
            setSendMessageOpen(false);
            setSelectedReceiverId(undefined);
            setSelectedReceiverName(undefined);
          }}
          receiverId={selectedReceiverId}
          receiverName={selectedReceiverName}
          onSuccess={() => {
            setSendMessageOpen(false);
          }}
        />
      )}
      </Container>
    </Box>
  );
}

