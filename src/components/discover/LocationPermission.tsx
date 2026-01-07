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
  Alert,
  CircularProgress,
} from '@mui/material';
import { LocationOn, Close } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { updateUserLocationByCity } from '@/lib/users-api';
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
  const [city, setCity] = useState('');
  const [selectedCity, setSelectedCity] = useState<{
    city: string;
    region?: string;
    country?: string;
  } | null>(null);

  const handleSave = async () => {
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

          <Typography variant="body1">{t('description')}</Typography>
          
          <CityAutocomplete
            value={city}
            onChange={(value) => setCity(value || '')}
            onSelect={(cityData) => {
              setSelectedCity(cityData);
              // Build display name from city data
              const parts = [cityData.city];
              if (cityData.region) parts.push(cityData.region);
              if (cityData.country) parts.push(cityData.country);
              setCity(parts.join(', '));
            }}
            disabled={loading}
            error={!!error && !city.trim()}
            helperText={error && !city.trim() ? error : undefined}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          {t('later')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading || !selectedCity || !selectedCity.city.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? tCommon('loading') : t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

