'use client';

import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box,
  Container,
  IconButton
} from '@mui/material';
import { Inbox } from '@mui/icons-material';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/hooks/useAuth';
import UserDropdown from './UserDropdown';
import LanguageSwitcher from './LanguageSwitcher';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import NotificationBadge from '@/components/NotificationBadge';

export default function Navbar() {
  const router = useRouter();
  const { user, canReceive } = useAuth();
  const { unreadCount } = useUnreadMessages();

  const handleLogoClick = () => {
    router.push('/');
  };

  const handleMessagesClick = () => {
    router.push('/messages/received');
  };

  return (
    <AppBar position="sticky" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="div"
            onClick={handleLogoClick}
            sx={{
              mr: 2,
              display: { xs: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
              '&:hover': {
                opacity: 0.8,
              },
            }}
          >
            JustGift
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {user && canReceive && (
              <IconButton
                color="inherit"
                onClick={handleMessagesClick}
                sx={{
                  position: 'relative',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <NotificationBadge count={unreadCount} pulse={unreadCount > 0}>
                  <Inbox />
                </NotificationBadge>
              </IconButton>
            )}
            <LanguageSwitcher />
            <UserDropdown />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
