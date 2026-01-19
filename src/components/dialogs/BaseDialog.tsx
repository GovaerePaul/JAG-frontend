'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import GradientTypography from '@/components/ui/GradientTypography';

interface BaseDialogProps {
  open: boolean;
  onClose: () => void;
  title: string | React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  showCloseButton?: boolean;
}

export default function BaseDialog({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  icon,
  showCloseButton = false,
}: BaseDialogProps) {
  const isTitleString = typeof title === 'string';

  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth={fullWidth}>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon && <Box sx={{ color: '#FE6B8B' }}>{icon}</Box>}
          {isTitleString ? (
            <GradientTypography variant="h6">{title}</GradientTypography>
          ) : (
            title
          )}
        </Box>
        {showCloseButton && (
          <IconButton onClick={onClose} sx={{ minWidth: 'auto' }}>
            <Close />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
      {actions && <DialogActions sx={{ px: 3, pb: 2 }}>{actions}</DialogActions>}
    </Dialog>
  );
}
