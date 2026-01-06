'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  CircularProgress,
  Alert,
  InputAdornment,
  Chip,
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import { Explore } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { useDiscoverUsers } from '@/hooks/useDiscoverUsers';
import { DiscoverUsersFilters } from '@/lib/users-api';
import UserCard from '@/components/discover/UserCard';
import DiscoverFilters from '@/components/discover/DiscoverFilters';
import LocationPermission from '@/components/discover/LocationPermission';
import SendMessageForm from '@/components/messages/SendMessageForm';

export default function DiscoverPage() {
  const t = useTranslations('discover');
  const { userProfile } = useAuth();
  const { users, loading, error, currentDistance, isExpanding, search, loadMore, reset } =
    useDiscoverUsers({
      initialDistance: 50,
      maxDistance: 500,
      autoExpand: true,
    });

  const [searchQuery, setSearchQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<DiscoverUsersFilters>();
  const [locationPermissionOpen, setLocationPermissionOpen] = useState(false);
  const [sendMessageOpen, setSendMessageOpen] = useState(false);
  const [selectedReceiverId, setSelectedReceiverId] = useState<string>();
  const [selectedReceiverName, setSelectedReceiverName] = useState<string>();

  // Check if location permission is needed
  useEffect(() => {
    if (userProfile && userProfile.preferences?.shareLocation !== true) {
      // Show location permission dialog on first visit
      const hasSeenPrompt = localStorage.getItem('discover_location_prompt_seen');
      if (!hasSeenPrompt) {
        setLocationPermissionOpen(true);
        localStorage.setItem('discover_location_prompt_seen', 'true');
      }
    }
  }, [userProfile]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    search({ search: query, filters });
  };

  const handleFiltersApply = (newFilters: DiscoverUsersFilters) => {
    setFilters(newFilters);
    search({ search: searchQuery, filters: newFilters });
  };

  const handleSendMessage = (userId: string, userName?: string) => {
    setSelectedReceiverId(userId);
    setSelectedReceiverName(userName);
    setSendMessageOpen(true);
  };

  const handleLocationEnabled = () => {
    // Reload search after location is enabled
    search({ search: searchQuery, filters });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('subtitle')}
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          fullWidth
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, minWidth: 200 }}
        />
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={() => setFiltersOpen(true)}
        >
          {t('filters')}
        </Button>
      </Box>

      {/* Distance indicator */}
      {(isExpanding || currentDistance > 50) && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {isExpanding
            ? t('expanding', { current: currentDistance - 25, next: currentDistance })
            : t('searching', { distance: currentDistance })}
        </Alert>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* Results */}
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

          <Grid container spacing={3}>
            {users.map((discoveredUser) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={discoveredUser.user.uid}>
                <UserCard
                  user={discoveredUser}
                  onSendMessage={(userId) =>
                    handleSendMessage(userId, discoveredUser.user.displayName)
                  }
                />
              </Grid>
            ))}
          </Grid>

          {/* Load More */}
          {users.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              {loading ? (
                <CircularProgress />
              ) : (
                <Button
                  variant="outlined"
                  onClick={loadMore}
                  disabled={loading}
                >
                  Load More
                </Button>
              )}
            </Box>
          )}
        </>
      )}

      {/* Dialogs */}
      <DiscoverFilters
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onApply={handleFiltersApply}
        initialFilters={filters}
      />

      <LocationPermission
        open={locationPermissionOpen}
        onClose={() => setLocationPermissionOpen(false)}
        onLocationEnabled={handleLocationEnabled}
      />

      <SendMessageForm
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
    </Container>
  );
}

