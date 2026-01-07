'use client';

import { useState } from 'react';
import {
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import {
  AccountCircle,
  Person,
  Logout,
  Login
} from '@mui/icons-material';
import { useRouter } from '@/i18n/navigation';
import { logout } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';

export default function UserDropdown() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const t = useTranslations('common');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    try {
      await logout();
      handleClose();
    } catch (error) {
      // Silent fail
    }
  };

  const handleSignIn = () => {
    router.push('/auth');
    handleClose();
  };

  const handleProfile = () => {
    router.push('/profile');
    handleClose();
  };

  if (loading) {
    return <CircularProgress size={24} />;
  }

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ ml: 2 }}
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        {user ? (
          <Avatar 
            src={user.photoURL || undefined}
            sx={{ width: 32, height: 32 }}
          >
            {user.displayName ? user.displayName[0].toUpperCase() : user.email?.[0].toUpperCase()}
          </Avatar>
        ) : (
          <Avatar sx={{ width: 32, height: 32 }}>
            <AccountCircle />
          </Avatar>
        )}
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 200,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
      >
        {user ? [
            <Box key="user-info" sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" noWrap>
                {user.displayName || t('user')}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {user.email}
              </Typography>
            </Box>,
            <Divider key="divider-1" />,
            <MenuItem key="profile" onClick={handleProfile}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t('profile')}</ListItemText>
            </MenuItem>,
            <Divider key="divider-2" />,
            <MenuItem key="logout" onClick={handleSignOut}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t('logout')}</ListItemText>
            </MenuItem>
        ] : (
          <MenuItem onClick={handleSignIn}>
            <ListItemIcon>
              <Login fontSize="small" />
            </ListItemIcon>
              <ListItemText>{t('login')}</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
