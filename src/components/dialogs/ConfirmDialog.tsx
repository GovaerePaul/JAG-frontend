'use client';

import { Button, CircularProgress, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import BaseDialog from './BaseDialog';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  loading?: boolean;
  confirmColor?: 'primary' | 'error' | 'warning';
}

export default function ConfirmDialog({
  open,
  onClose,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  loading = false,
  confirmColor = 'primary',
}: ConfirmDialogProps) {
  const tCommon = useTranslations('common');

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={title}
      actions={
        <>
          <Button
            onClick={onClose}
            disabled={loading}
            sx={{
              textTransform: 'none',
              color: 'text.secondary',
            }}
          >
            {cancelText || tCommon('cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={loading}
            color={confirmColor}
            startIcon={loading ? <CircularProgress size={20} /> : undefined}
            sx={{
              textTransform: 'none',
              background:
                confirmColor === 'error'
                  ? 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)'
                  : 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              boxShadow: '0 4px 15px rgba(254, 107, 139, 0.3)',
              '&:hover': {
                background:
                  confirmColor === 'error'
                    ? 'linear-gradient(45deg, #d32f2f 40%, #f44336 100%)'
                    : 'linear-gradient(45deg, #FE6B8B 40%, #FF8E53 100%)',
                boxShadow: '0 6px 20px rgba(254, 107, 139, 0.4)',
              },
              '&:disabled': {
                opacity: 0.6,
              },
            }}
          >
            {loading ? tCommon('loading') : confirmText || tCommon('confirm')}
          </Button>
        </>
      }
    >
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </BaseDialog>
  );
}
