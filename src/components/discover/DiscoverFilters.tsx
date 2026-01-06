'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { FilterList, Close } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { DiscoverUsersFilters } from '@/lib/users-api';
import { useEventTypes } from '@/hooks/useEventTypes';

interface DiscoverFiltersProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: DiscoverUsersFilters) => void;
  initialFilters?: DiscoverUsersFilters;
}

export default function DiscoverFilters({
  open,
  onClose,
  onApply,
  initialFilters,
}: DiscoverFiltersProps) {
  const t = useTranslations('discover.filterOptions');
  const tCommon = useTranslations('common');
  const { eventTypes } = useEventTypes();

  const [maxDistance, setMaxDistance] = useState(initialFilters?.maxDistance || 50);
  const [minAge, setMinAge] = useState(initialFilters?.minAge);
  const [maxAge, setMaxAge] = useState(initialFilters?.maxAge);
  const [eventTypeId, setEventTypeId] = useState(initialFilters?.eventTypeId || '');
  const [newUsersOnly, setNewUsersOnly] = useState(false);

  useEffect(() => {
    if (initialFilters) {
      setMaxDistance(initialFilters.maxDistance || 50);
      setMinAge(initialFilters.minAge);
      setMaxAge(initialFilters.maxAge);
      setEventTypeId(initialFilters.eventTypeId || '');
    }
  }, [initialFilters]);

  const handleApply = () => {
    const filters: DiscoverUsersFilters = {
      maxDistance,
      ...(minAge !== undefined && { minAge }),
      ...(maxAge !== undefined && { maxAge }),
      ...(eventTypeId && { eventTypeId }),
    };
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setMaxDistance(50);
    setMinAge(undefined);
    setMaxAge(undefined);
    setEventTypeId('');
    setNewUsersOnly(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList color="primary" />
          <Typography variant="h6">{t('title')}</Typography>
        </Box>
        <Button onClick={onClose} sx={{ minWidth: 'auto' }}>
          <Close />
        </Button>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 1 }}>
          {/* Distance Filter */}
          <Box>
            <Typography gutterBottom>{t('distance')}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('maxDistance', { distance: maxDistance })}
            </Typography>
            <Slider
              value={maxDistance}
              onChange={(_, value) => setMaxDistance(value as number)}
              min={10}
              max={500}
              step={10}
              marks={[
                { value: 10, label: '10km' },
                { value: 100, label: '100km' },
                { value: 250, label: '250km' },
                { value: 500, label: '500km' },
              ]}
            />
          </Box>

          {/* Age Filter */}
          <Box>
            <Typography gutterBottom>{t('age')}</Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {t('minAge')}
                </Typography>
                <Slider
                  value={minAge || 18}
                  onChange={(_, value) => setMinAge(value as number)}
                  min={18}
                  max={100}
                  step={1}
                  marks={[
                    { value: 18, label: '18' },
                    { value: 50, label: '50' },
                    { value: 100, label: '100' },
                  ]}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {t('maxAge')}
                </Typography>
                <Slider
                  value={maxAge || 100}
                  onChange={(_, value) => setMaxAge(value as number)}
                  min={18}
                  max={100}
                  step={1}
                  marks={[
                    { value: 18, label: '18' },
                    { value: 50, label: '50' },
                    { value: 100, label: '100' },
                  ]}
                />
              </Box>
            </Box>
          </Box>

          {/* Event Type Filter */}
          <FormControl fullWidth>
            <InputLabel>{t('eventType')}</InputLabel>
            <Select
              value={eventTypeId}
              onChange={(e) => setEventTypeId(e.target.value)}
              label={t('eventType')}
            >
              <MenuItem value="">{tCommon('unknown')}</MenuItem>
              {eventTypes.map((event) => (
                <MenuItem key={event.id} value={event.id}>
                  {event.icon} {event.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* New Users Only */}
          <FormControlLabel
            control={
              <Checkbox
                checked={newUsersOnly}
                onChange={(e) => setNewUsersOnly(e.target.checked)}
              />
            }
            label={t('newUsersOnly')}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleReset}>{t('reset')}</Button>
        <Button onClick={onClose}>{tCommon('cancel')}</Button>
        <Button variant="contained" onClick={handleApply}>
          {t('apply')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

