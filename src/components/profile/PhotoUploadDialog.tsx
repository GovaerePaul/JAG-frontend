'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Avatar,
  Button,
  Alert,
  LinearProgress,
  Typography,
  CircularProgress,
} from '@mui/material';
import { CameraAlt, Delete, Save } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { User } from 'firebase/auth';
import { reload } from 'firebase/auth';
import { uploadProfilePicture, deleteProfilePicture } from '@/lib/storage';
import { updateUserProfileOnBackend } from '@/lib/auth';
import { getUserEmail } from '@/lib/userUtils';
import BaseDialog from '@/components/dialogs/BaseDialog';
import GradientButton from '@/components/ui/GradientButton';

interface PhotoUploadDialogProps {
  open: boolean;
  onClose: () => void;
  user: User;
  currentPhotoURL: string | null;
  onPhotoUpdated: (newPhotoURL: string | null) => void;
}

export default function PhotoUploadDialog({
  open,
  onClose,
  user,
  currentPhotoURL,
  onPhotoUpdated,
}: PhotoUploadDialogProps) {
  const t = useTranslations('profile');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) {
      setPhotoPreview(null);
      setSelectedPhotoFile(null);
      setPhotoError(null);
    }
  }, [open]);

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError(t('photoError') || 'File must be an image');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPhotoError(t('photoSizeError') || 'Image is too large (max 10MB)');
      return;
    }

    setPhotoError(null);
    setSelectedPhotoFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = async () => {
    if (!selectedPhotoFile || !user) return;

    setUploadingPhoto(true);
    setPhotoError(null);

    try {
      const newPhotoURL = await uploadProfilePicture(user.uid, selectedPhotoFile);

      if (user.photoURL) {
        try {
          await deleteProfilePicture(user.photoURL);
        } catch (error) {
          // Ignore error when deleting old photo
        }
      }

      const result = await updateUserProfileOnBackend({ photoURL: newPhotoURL });
      if (result.success) {
        onPhotoUpdated(newPhotoURL);

        if (user) {
          try {
            await reload(user);
          } catch (error) {
            // Ignore error when reloading user
          }
        }

        onClose();
        setPhotoPreview(null);
        setSelectedPhotoFile(null);
      } else {
        setPhotoError(result.error || t('photoError') || 'Error updating profile');
      }
    } catch (error) {
      setPhotoError(
        error instanceof Error ? error.message : t('photoError') || 'Error uploading photo'
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!user || !user.photoURL) return;

    setUploadingPhoto(true);
    setPhotoError(null);

    try {
      await deleteProfilePicture(user.photoURL);

      const result = await updateUserProfileOnBackend({ photoURL: '' });
      if (result.success) {
        onPhotoUpdated(null);

        if (user) {
          try {
            await reload(user);
          } catch (error) {
            // Ignore error when reloading user
          }
        }

        onClose();
        setPhotoPreview(null);
        setSelectedPhotoFile(null);
      } else {
        setPhotoError(result.error || t('photoError') || 'Error removing photo');
      }
    } catch (error) {
      setPhotoError(
        error instanceof Error ? error.message : t('photoError') || 'Error removing photo'
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleClose = () => {
    if (!uploadingPhoto) {
      onClose();
    }
  };

  return (
    <BaseDialog
      open={open}
      onClose={handleClose}
      title={t('changePhoto')}
      icon={<CameraAlt />}
      maxWidth="sm"
      fullWidth
      actions={
        <>
          <Button
            onClick={handleClose}
            disabled={uploadingPhoto}
            sx={{
              textTransform: 'none',
              color: 'text.secondary',
            }}
          >
            {t('cancel')}
          </Button>
          <GradientButton
            onClick={handlePhotoUpload}
            disabled={uploadingPhoto || !selectedPhotoFile}
            startIcon={uploadingPhoto ? <CircularProgress size={20} /> : <Save />}
          >
            {uploadingPhoto ? t('photoUploading') || 'Upload...' : t('save') || 'Enregistrer'}
          </GradientButton>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
        {photoError && (
          <Alert
            severity="error"
            onClose={() => setPhotoError(null)}
            sx={{
              borderRadius: 2,
              '& .MuiAlert-icon': {
                color: '#FE6B8B',
              },
            }}
          >
            {photoError}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Avatar
            src={photoPreview || currentPhotoURL || user.photoURL || undefined}
            sx={{
              width: 150,
              height: 150,
              fontSize: '3rem',
              border: '4px solid',
              borderColor: 'transparent',
              background: 'linear-gradient(135deg, #FE6B8B, #FF8E53)',
              backgroundClip: 'padding-box',
              boxShadow: '0 4px 20px rgba(254, 107, 139, 0.3)',
            }}
          >
            {user.displayName?.charAt(0) || getUserEmail(user)?.charAt(0)}
          </Avatar>
        </Box>

        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="photo-upload-input"
          type="file"
          onChange={handlePhotoSelect}
          disabled={uploadingPhoto}
        />
        <label htmlFor="photo-upload-input">
          <Button
            variant="outlined"
            component="span"
            fullWidth
            startIcon={<CameraAlt />}
            disabled={uploadingPhoto}
            sx={{
              textTransform: 'none',
              borderColor: '#FE6B8B',
              color: '#FE6B8B',
              '&:hover': {
                borderColor: '#FF8E53',
                backgroundColor: 'rgba(254, 107, 139, 0.04)',
              },
            }}
          >
            {photoPreview ? t('changePhoto') : t('uploadPhoto')}
          </Button>
        </label>

        {uploadingPhoto && (
          <Box sx={{ width: '100%' }}>
            <LinearProgress
              sx={{
                borderRadius: 1,
                height: 6,
                backgroundColor: 'rgba(254, 107, 139, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                },
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
              {t('photoUploading')}
            </Typography>
          </Box>
        )}

        {user.photoURL && (
          <Button
            variant="outlined"
            color="error"
            fullWidth
            startIcon={<Delete />}
            onClick={handleRemovePhoto}
            disabled={uploadingPhoto}
            sx={{
              textTransform: 'none',
            }}
          >
            {t('removePhoto')}
          </Button>
        )}
      </Box>
    </BaseDialog>
  );
}
