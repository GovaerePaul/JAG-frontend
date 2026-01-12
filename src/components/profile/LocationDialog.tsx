'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Alert, Button, CircularProgress } from '@mui/material';
import { LocationOn, Save } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { updateUserLocationByCity } from '@/lib/users-api';
import CityAutocomplete from '@/components/discover/CityAutocomplete';
import BaseDialog from '@/components/dialogs/BaseDialog';
import GradientButton from '@/components/ui/GradientButton';

interface LocationDialogProps {
  open: boolean;
  onClose: () => void;
  currentLocation: string;
  onLocationUpdated: () => void;
}

export default function LocationDialog({
  open,
  onClose,
  currentLocation,
  onLocationUpdated,
}: LocationDialogProps) {
  const t = useTranslations('profile');
  const [locationCity, setLocationCity] = useState('');
  const [selectedLocationCity, setSelectedLocationCity] = useState<{
    city: string;
    region?: string;
    country?: string;
  } | null>(null);
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLocationCity(currentLocation);
      setSelectedLocationCity(null);
      setLocationError(null);
    }
  }, [open, currentLocation]);

  const handleUpdateLocation = async () => {
    if (!selectedLocationCity || !selectedLocationCity.city.trim()) {
      setLocationError(t('location.cityRequired') || 'Please select a city');
      return;
    }

    setUpdatingLocation(true);
    setLocationError(null);

    try {
      const response = await updateUserLocationByCity(selectedLocationCity.city);
      if (response.success) {
        onLocationUpdated();
        onClose();
        setLocationCity('');
        setSelectedLocationCity(null);
      } else {
        setLocationError(response.error || t('location.error') || 'Error updating location');
      }
    } catch (err) {
      setLocationError(
        err instanceof Error ? err.message : t('location.error') || 'Error updating location'
      );
    } finally {
      setUpdatingLocation(false);
    }
  };

  const handleClose = () => {
    if (!updatingLocation) {
      setLocationCity('');
      setSelectedLocationCity(null);
      setLocationError(null);
      onClose();
    }
  };

  return (
    <BaseDialog
      open={open}
      onClose={handleClose}
      title={t('location.editTitle') || 'Modifier la localisation'}
      icon={<LocationOn />}
      maxWidth="sm"
      fullWidth
      actions={
        <>
          <Button
            onClick={handleClose}
            disabled={updatingLocation}
            sx={{
              textTransform: 'none',
              color: 'text.secondary',
            }}
          >
            {t('cancel')}
          </Button>
          <GradientButton
            onClick={handleUpdateLocation}
            disabled={updatingLocation || !selectedLocationCity || !selectedLocationCity.city.trim()}
            startIcon={updatingLocation ? <CircularProgress size={20} /> : <Save />}
          >
            {updatingLocation ? t('common.loading') || 'Chargement...' : t('save') || 'Enregistrer'}
          </GradientButton>
        </>
      }
    >
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
          {t('location.description') ||
            'Sélectionnez votre ville pour permettre aux autres utilisateurs de vous trouver.'}
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
    </BaseDialog>
  );
}
