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
import { Visibility, VisibilityOff } from '@mui/icons-material';
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
      <Typography variant="h4" component="h1" gutterBottom textAlign="center">
        {t('login.title')}
      </Typography>

      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
        {t('login.subtitle')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
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
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={togglePasswordVisibility}
                edge="end"
                disabled={loading}
                aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2, py: 1.5 }}
        disabled={loading || !formData.email || !formData.password}
      >
        {loading ? t('login.loadingButton') : t('login.loginButton')}
      </Button>

      <Box textAlign="center">
        <Typography variant="body2">
          {t('login.noAccount')}{' '}
          <Button
            variant="text"
            onClick={onSwitchToRegister}
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            {t('login.signUp')}
          </Button>
        </Typography>
      </Box>
    </Box>
  );
}
