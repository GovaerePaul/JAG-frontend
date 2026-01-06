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
import { updateUserLocation, Coordinates } from '@/lib/users-api';

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

  const handleEnableLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError(t('unavailable'));
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const coordinates: Coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          const response = await updateUserLocation(coordinates);

          if (response.success) {
            onLocationEnabled();
            onClose();
          } else {
            setError(response.error || t('error'));
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : t('error'));
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError(t('denied'));
          setManualMode(true);
        } else {
          setError(t('unavailable'));
          setManualMode(true);
        }
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleManualSave = async () => {
    if (!city.trim()) {
      setError('Please enter a city');
      return;
    }

    setLoading(true);
    setError(null);

    // For manual entry, we'll need to geocode the city first
    // For now, we'll just close and let the user search manually
    // In a full implementation, you'd call an API to get coordinates from city name
    onClose();
    setLoading(false);
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
              <TextField
                label={t('cityLabel')}
                placeholder={t('cityPlaceholder')}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                fullWidth
                disabled={loading}
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
            disabled={loading || !city.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? tCommon('loading') : t('save')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

