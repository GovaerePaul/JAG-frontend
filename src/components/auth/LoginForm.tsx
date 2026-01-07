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
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, Email, Lock } from '@mui/icons-material';
import { signIn, translateFirebaseError } from '@/lib/auth';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const t = useTranslations('auth');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { user, error: authError } = await signIn(formData);

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
          <LoginIcon
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
          {t('login.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('login.subtitle')}
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
        label={t('login.emailLabel')}
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
        label={t('login.passwordLabel')}
        name="password"
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={handleChange}
        margin="normal"
        required
        autoComplete="current-password"
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
                aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
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

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading || !formData.email || !formData.password}
        startIcon={<LoginIcon />}
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
        {loading ? t('login.loadingButton') : t('login.loginButton')}
      </Button>

      <Box textAlign="center">
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('login.noAccount')}{' '}
          <Button
            variant="text"
            onClick={onSwitchToRegister}
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
            {t('login.signUp')}
          </Button>
        </Typography>
      </Box>
    </Box>
  );
}
