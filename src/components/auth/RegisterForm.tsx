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
import { signUp, translateFirebaseError } from '@/lib/auth';

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
      displayName: formData.displayName.trim()
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
      <Typography variant="h4" component="h1" gutterBottom textAlign="center">
        {t('register.title')}
      </Typography>

      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
        {t('register.subtitle')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
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
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={togglePasswordVisibility}
                edge="end"
                disabled={loading}
                aria-label={showPassword ? t('register.hidePassword') : t('register.showPassword')}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
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
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={toggleConfirmPasswordVisibility}
                edge="end"
                disabled={loading}
                aria-label={showConfirmPassword ? t('register.hidePassword') : t('register.showPassword')}
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
        disabled={loading || !isFormValid}
      >
        {loading ? t('register.loadingButton') : t('register.registerButton')}
      </Button>

      <Box textAlign="center">
        <Typography variant="body2">
          {t('register.hasAccount')}{' '}
          <Button
            variant="text"
            onClick={onSwitchToLogin}
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            {t('register.signIn')}
          </Button>
        </Typography>
      </Box>
    </Box>
  );
}
