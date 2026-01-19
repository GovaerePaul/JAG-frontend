'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Slider,
} from '@mui/material';
import { FilterList, Close } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

interface DiscoverFiltersProps {
  open: boolean;
  onClose: () => void;
  onDistanceChange: (distance: number) => void;
  currentDistance: number;
}

const distanceMarks = [
  { value: 10, label: '10km' },
  { value: 100, label: '100km' },
  { value: 250, label: '250km' },
  { value: 500, label: '500km' },
];

export default function DiscoverFilters({
  open,
  onClose,
  onDistanceChange,
  currentDistance,
}: DiscoverFiltersProps) {
  const t = useTranslations('discover.filterOptions');
  const tCommon = useTranslations('common');
  const [localDistance, setLocalDistance] = useState(currentDistance);

  const handleApply = () => {
    onDistanceChange(localDistance);
    onClose();
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
          <Box>
            <Typography gutterBottom>{t('distance')}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('maxDistance', { distance: localDistance })}
            </Typography>
            <Box sx={{ px: 1 }}>
              <Slider
                value={localDistance}
                onChange={(_, value) => setLocalDistance(value as number)}
                min={10}
                max={500}
                step={10}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value} km`}
                marks={distanceMarks}
                sx={{
                  '& .MuiSlider-markLabel': {
                    fontSize: '0.75rem',
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>{tCommon('close')}</Button>
        <Button 
          variant="contained" 
          onClick={handleApply}
          sx={{
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #FE6B8B 50%, #FF8E53 100%)',
            },
          }}
        >
          {t('apply')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

