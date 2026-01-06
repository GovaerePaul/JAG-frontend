'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { LocationOn, Close } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { updateUserLocation, updateUserLocationByCity, Coordinates } from '@/lib/users-api';
import CityAutocomplete from './CityAutocomplete';

interface LocationPermissionProps {
  open: boolean;
  onClose: () => void;
  onLocationEnabled: () => void;
}

export default function LocationPermission({
  open,
  onClose,
  onLocationEnabled,
}: LocationPermissionProps) {
  const t = useTranslations('discover.locationPermission');
  const tCommon = useTranslations('common');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [city, setCity] = useState('');
  const [selectedCity, setSelectedCity] = useState<{
    city: string;
    region?: string;
    country?: string;
  } | null>(null);

  const handleEnableLocation = (retry = false) => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError(t('unavailable'));
      setLoading(false);
      return;
    }

    const options: PositionOptions = retry
      ? {
          enableHighAccuracy: false,
          timeout: 30000,
          maximumAge: 600000, // Accept cached position up to 10 minutes old
        }
      : {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 300000, // Accept cached position up to 5 minutes old
        };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          console.log('Geolocation success:', {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });

          const coordinates: Coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          const response = await updateUserLocation(coordinates);

          if (response.success) {
            onLocationEnabled();
            onClose();
          } else {
            console.error('Failed to update location:', response.error);
            setError(response.error || t('error'));
          }
        } catch (err) {
          console.error('Error updating location:', err);
          setError(err instanceof Error ? err.message : t('error'));
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', {
          code: err.code,
          message: err.message,
          PERMISSION_DENIED: err.PERMISSION_DENIED,
          POSITION_UNAVAILABLE: err.POSITION_UNAVAILABLE,
          TIMEOUT: err.TIMEOUT,
        });

        // err.code: 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
        if (err.code === 1) {
          setError(t('denied'));
          setManualMode(true);
        } else if (err.code === 3 && !retry) {
          // Timeout - try again with less strict options
          console.log('Retrying with less strict options...');
          handleEnableLocation(true);
          return;
        } else {
          setError(t('unavailable'));
          setManualMode(true);
        }
        setLoading(false);
      },
      options
    );
  };

  const handleManualSave = async () => {
    if (!selectedCity || !selectedCity.city.trim()) {
      setError(t('cityRequired') || 'Please select a city');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await updateUserLocationByCity(selectedCity.city);

      if (response.success) {
        onLocationEnabled();
        onClose();
      } else {
        setError(response.error || t('error'));
      }
    } catch (err) {
      console.error('Error updating location by city:', err);
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOn color="primary" />
          <Typography variant="h6">{t('title')}</Typography>
        </Box>
        <Button onClick={onClose} disabled={loading} sx={{ minWidth: 'auto' }}>
          <Close />
        </Button>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {!manualMode ? (
            <>
              <Typography variant="body1">{t('description')}</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setManualMode(true)}
                  disabled={loading}
                >
                  {t('manual')}
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Typography variant="body1">
                {t('denied')}
              </Typography>
              <CityAutocomplete
                value={city}
                onChange={(value) => setCity(value || '')}
                onSelect={(cityData) => {
                  setSelectedCity(cityData);
                  setCity(cityData.displayName || cityData.city);
                }}
                disabled={loading}
                error={!!error && !city.trim()}
                helperText={error && !city.trim() ? error : undefined}
              />
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          {t('later')}
        </Button>
        {!manualMode ? (
          <Button
            variant="contained"
            onClick={handleEnableLocation}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <LocationOn />}
          >
            {loading ? tCommon('loading') : t('enable')}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleManualSave}
            disabled={loading || !selectedCity || !selectedCity.city.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? tCommon('loading') : t('save')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

