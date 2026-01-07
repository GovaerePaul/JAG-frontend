'use client';

import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box,
  Container,
  IconButton
} from '@mui/material';
import { Inbox, Explore, EmojiEvents } from '@mui/icons-material';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/hooks/useAuth';
import UserDropdown from './UserDropdown';
import LanguageSwitcher from './LanguageSwitcher';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import NotificationBadge from '@/components/NotificationBadge';
import { useTranslations } from 'next-intl';

export default function Navbar() {
  const router = useRouter();
  const { user, canReceive } = useAuth();
  const { unreadCount } = useUnreadMessages();
  const t = useTranslations('discover');

  const handleLogoClick = () => {
    router.push('/');
  };

  const handleMessagesClick = () => {
    router.push('/messages/received');
  };

  const handleDiscoverClick = () => {
    router.push('/discover');
  };

  const handleQuestsClick = () => {
    router.push('/quests');
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
            {user && (
              <>
                <IconButton
                  color="inherit"
                  onClick={handleQuestsClick}
                  aria-label="Quests"
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <EmojiEvents />
                </IconButton>
                <IconButton
                  color="inherit"
                  onClick={handleDiscoverClick}
                  aria-label={t('title')}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <Explore />
                </IconButton>
              </>
            )}
            {user && canReceive && (
              <IconButton
                color="inherit"
                onClick={handleMessagesClick}
                aria-label="Messages"
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
