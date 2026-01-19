'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { FilterList, Close } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

interface DiscoverFiltersProps {
  open: boolean;
  onClose: () => void;
  onDistanceChange: (distance: number) => void;
  currentDistance: number;
}

export default function DiscoverFilters({
  open,
  onClose,
  onDistanceChange,
  currentDistance,
}: DiscoverFiltersProps) {
  const t = useTranslations('discover.filterOptions');
  const tCommon = useTranslations('common');

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
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={currentDistance === 50 ? 'contained' : 'outlined'}
                disabled={currentDistance === 50}
                onClick={() => onDistanceChange(50)}
                sx={{ flex: 1 }}
              >
                50 km
              </Button>
              <Button
                variant={currentDistance === 250 ? 'contained' : 'outlined'}
                disabled={currentDistance === 250}
                onClick={() => onDistanceChange(250)}
                sx={{ flex: 1 }}
              >
                250 km
              </Button>
              <Button
                variant={currentDistance === 500 ? 'contained' : 'outlined'}
                disabled={currentDistance === 500}
                onClick={() => onDistanceChange(500)}
                sx={{ flex: 1 }}
              >
                500 km
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>{tCommon('close')}</Button>
      </DialogActions>
    </Dialog>
  );
}

