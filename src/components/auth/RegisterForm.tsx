'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { Visibility, VisibilityOff, Send, Inbox, SwapHoriz, Email, Lock } from '@mui/icons-material';
import { signUp, translateFirebaseError, UserRole } from '@/lib/auth';

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const t = useTranslations('auth');
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [role, setRole] = useState<UserRole>('both');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Effacer l'erreur quand l'utilisateur tape
    if (error) setError('');
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError(t('common.errors.passwordMismatch'));
      return false;
    }
    if (formData.password.length < 6) {
      setError(t('common.errors.passwordTooShort'));
      return false;
    }
    if (!formData.displayName.trim()) {
      setError(t('common.errors.required'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    const { user, error: authError } = await signUp({
      email: formData.email,
      password: formData.password,
      displayName: formData.displayName.trim(),
      role
    });

    if (authError) {
      setError(translateFirebaseError(authError));
    } else if (user) {
      onSuccess();
    }

    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const isFormValid = 
    formData.displayName.trim() &&
    formData.email &&
    formData.password &&
    formData.confirmPassword;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(254, 107, 139, 0.1) 0%, rgba(255, 142, 83, 0.1) 100%)',
            mb: 2,
          }}
        >
          <Send
            sx={{
              fontSize: 32,
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          />
        </Box>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          {t('register.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('register.subtitle')}
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: 2,
            '& .MuiAlert-icon': {
              color: '#FE6B8B',
            },
          }}
        >
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label={t('register.nameLabel')}
        name="displayName"
        value={formData.displayName}
        onChange={handleChange}
        margin="normal"
        required
        autoComplete="name"
        disabled={loading}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#FE6B8B',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#FE6B8B',
                borderWidth: 2,
              },
            },
          },
        }}
      />

      <TextField
        fullWidth
        label={t('register.emailLabel')}
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        margin="normal"
        required
        autoComplete="email"
        disabled={loading}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Email sx={{ color: 'text.secondary', fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#FE6B8B',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#FE6B8B',
                borderWidth: 2,
              },
            },
          },
        }}
      />

      <TextField
        fullWidth
        label={t('register.passwordLabel')}
        name="password"
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={handleChange}
        margin="normal"
        required
        autoComplete="new-password"
        disabled={loading}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock sx={{ color: 'text.secondary', fontSize: 20 }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={togglePasswordVisibility}
                edge="end"
                disabled={loading}
                aria-label={showPassword ? t('register.hidePassword') : t('register.showPassword')}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: '#FE6B8B',
                  },
                }}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#FE6B8B',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#FE6B8B',
                borderWidth: 2,
              },
            },
          },
        }}
      />

      <TextField
        fullWidth
        label={t('register.confirmPasswordLabel')}
        name="confirmPassword"
        type={showConfirmPassword ? 'text' : 'password'}
        value={formData.confirmPassword}
        onChange={handleChange}
        margin="normal"
        required
        autoComplete="new-password"
        disabled={loading}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock sx={{ color: 'text.secondary', fontSize: 20 }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={toggleConfirmPasswordVisibility}
                edge="end"
                disabled={loading}
                aria-label={showConfirmPassword ? t('register.hidePassword') : t('register.showPassword')}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: '#FE6B8B',
                  },
                }}
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#FE6B8B',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#FE6B8B',
                borderWidth: 2,
              },
            },
          },
        }}
      />

      <Box sx={{ mt: 3, mb: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 500 }}>
          {t('register.roleLabel')}
        </Typography>
        <ToggleButtonGroup
          value={role}
          exclusive
          onChange={(_, newRole) => newRole && setRole(newRole)}
          fullWidth
          disabled={loading}
          sx={{
            '& .MuiToggleButton-root': {
              py: 1.5,
              flexDirection: 'column',
              gap: 0.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: '#FE6B8B',
                background: 'rgba(254, 107, 139, 0.05)',
              },
              '&.Mui-selected': {
                background: 'linear-gradient(135deg, rgba(254, 107, 139, 0.1) 0%, rgba(255, 142, 83, 0.1) 100%)',
                borderColor: '#FE6B8B',
                color: '#FE6B8B',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(254, 107, 139, 0.15) 0%, rgba(255, 142, 83, 0.15) 100%)',
                },
              },
            },
          }}
        >
          <ToggleButton value="sender">
            <Send fontSize="small" />
            <Typography variant="caption" sx={{ fontWeight: 'inherit' }}>
              {t('register.roleSender')}
            </Typography>
          </ToggleButton>
          <ToggleButton value="receiver">
            <Inbox fontSize="small" />
            <Typography variant="caption" sx={{ fontWeight: 'inherit' }}>
              {t('register.roleReceiver')}
            </Typography>
          </ToggleButton>
          <ToggleButton value="both">
            <SwapHoriz fontSize="small" />
            <Typography variant="caption" sx={{ fontWeight: 'inherit' }}>
              {t('register.roleBoth')}
            </Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading || !isFormValid}
        startIcon={<Send />}
        sx={{
          mt: 3,
          mb: 2,
          py: 1.5,
          borderRadius: 2,
          background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
          boxShadow: '0 4px 15px rgba(254, 107, 139, 0.3)',
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 600,
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'linear-gradient(45deg, #FE6B8B 40%, #FF8E53 100%)',
            boxShadow: '0 6px 20px rgba(254, 107, 139, 0.4)',
            transform: 'translateY(-2px)',
          },
          '&:disabled': {
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            opacity: 0.6,
          },
        }}
      >
        {loading ? t('register.loadingButton') : t('register.registerButton')}
      </Button>

      <Box textAlign="center">
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('register.hasAccount')}{' '}
          <Button
            variant="text"
            onClick={onSwitchToLogin}
            disabled={loading}
            sx={{
              textTransform: 'none',
              color: '#FE6B8B',
              fontWeight: 600,
              '&:hover': {
                background: 'rgba(254, 107, 139, 0.08)',
              },
            }}
          >
            {t('register.signIn')}
          </Button>
        </Typography>
      </Box>
    </Box>
  );
}
