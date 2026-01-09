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
  Divider
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, Email, Lock } from '@mui/icons-material';
import { signIn, getFirebaseErrorKey } from '@/lib/auth';
import { signInWithGoogle, signInWithFacebook } from '@/lib/oauth';

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
      const errorKey = getFirebaseErrorKey(authError);
      setError(t(errorKey));
    } else if (user) {
      onSuccess();
    }

    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    const { user, error: authError } = await signInWithGoogle();

    if (authError) {
      const errorKey = getFirebaseErrorKey(authError);
      setError(t(errorKey));
    } else if (user) {
      onSuccess();
    }

    setLoading(false);
  };

  const handleFacebookSignIn = async () => {
    setLoading(true);
    setError('');

    const { user, error: authError } = await signInWithFacebook();

    if (authError) {
      const errorKey = getFirebaseErrorKey(authError);
      setError(t(errorKey));
    } else if (user) {
      onSuccess();
    }

    setLoading(false);
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

      {/* OAuth Buttons */}
      <Box sx={{ mb: 3 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleGoogleSignIn}
          disabled={loading}
          startIcon={
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
          }
          sx={{
            py: 1.5,
            borderRadius: 2,
            borderColor: 'divider',
            color: 'text.primary',
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 500,
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: '#4285F4',
              backgroundColor: 'rgba(66, 133, 244, 0.04)',
            },
            '&:disabled': {
              opacity: 0.6,
            },
          }}
        >
          {t('oauth.continueWithGoogle')}
        </Button>

        {/* Temporarily hidden - Facebook OAuth not working */}
        {/* <Button
          fullWidth
          variant="outlined"
          onClick={handleFacebookSignIn}
          disabled={loading}
          startIcon={
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#1877F2" d="M48 24C48 10.745 37.255 0 24 0S0 10.745 0 24c0 11.979 8.776 21.908 20.25 23.708v-16.77h-6.094V24h6.094v-5.288c0-6.014 3.583-9.337 9.065-9.337 2.625 0 5.372.469 5.372.469v5.906h-3.026c-2.981 0-3.911 1.85-3.911 3.75V24h6.656l-1.064 6.938H27.75v16.77C39.224 45.908 48 35.978 48 24z"/>
            </svg>
          }
          sx={{
            mt: 1.5,
            py: 1.5,
            borderRadius: 2,
            borderColor: 'divider',
            color: 'text.primary',
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 500,
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: '#1877F2',
              backgroundColor: 'rgba(24, 119, 242, 0.04)',
            },
            '&:disabled': {
              opacity: 0.6,
            },
          }}
        >
          {t('oauth.continueWithFacebook')}
        </Button> */}
      </Box>

      {/* Divider */}
      <Divider sx={{ my: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
          {t('oauth.orDivider')}
        </Typography>
      </Divider>

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
