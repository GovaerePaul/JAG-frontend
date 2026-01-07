'use client';

import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box,
  Container,
  IconButton
} from '@mui/material';
import { Inbox, Explore, EmojiEvents, Favorite } from '@mui/icons-material';
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
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(254, 107, 139, 0.1)',
        boxShadow: '0 2px 20px rgba(254, 107, 139, 0.08)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: 1 }}>
          <Box
            onClick={handleLogoClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mr: 3,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            <Favorite
              sx={{
                fontSize: 28,
                color: '#FE6B8B',
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': {
                    transform: 'scale(1)',
                  },
                  '50%': {
                    transform: 'scale(1.1)',
                  },
                },
              }}
            />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontFamily: 'inherit',
                fontWeight: 700,
                letterSpacing: '0.05em',
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textDecoration: 'none',
              }}
            >
              JustGift
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {user && (
              <>
                <IconButton
                  onClick={handleQuestsClick}
                  aria-label="Quests"
                  sx={{
                    color: 'text.primary',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(254, 107, 139, 0.1)',
                      color: '#FE6B8B',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <EmojiEvents />
                </IconButton>
                <IconButton
                  onClick={handleDiscoverClick}
                  aria-label={t('title')}
                  sx={{
                    color: 'text.primary',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(254, 107, 139, 0.1)',
                      color: '#FE6B8B',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Explore />
                </IconButton>
              </>
            )}
            {user && canReceive && (
              <IconButton
                onClick={handleMessagesClick}
                aria-label="Messages"
                sx={{
                  position: 'relative',
                  color: 'text.primary',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(254, 107, 139, 0.1)',
                    color: '#FE6B8B',
                    transform: 'translateY(-2px)',
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
