'use client';

import { 
  AppBar, 
  Toolbar, 
  Box,
  Container,
  IconButton
} from '@mui/material';
import { Inbox, Explore, EmojiEvents } from '@mui/icons-material';
import { useRouter } from '@/i18n/navigation';
import { User } from 'firebase/auth';
import UserDropdown from './UserDropdown';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationBadge from '@/components/NotificationBadge';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { getLogoPath } from '@/utils/level-icons';

interface NavbarProps {
  user: User | null;
  canReceive: boolean;
  unreadCount: number;
}

export default function Navbar({ user, canReceive, unreadCount }: NavbarProps) {
  const router = useRouter();
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
      <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
        <Toolbar disableGutters sx={{ py: { xs: 0.5, sm: 1 }, minHeight: { xs: 56, sm: 64 } }}>
          <Box
            onClick={handleLogoClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              mr: { xs: 1, sm: 3 },
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              height: { xs: 54, sm: 62 },
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            <Image
              src={getLogoPath()}
              alt="JustGift Logo"
              width={0}
              height={0}
              style={{
                width: 'auto',
                height: '100%',
                objectFit: 'contain',
              }}
              priority
            />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0, sm: 0.5 },
              flexShrink: 0,
            }}
          >
            {user && (
              <>
                <IconButton
                  onClick={handleQuestsClick}
                  aria-label="Quests"
                  size="small"
                  sx={{
                    color: 'text.primary',
                    transition: 'all 0.3s ease',
                    padding: { xs: 0.75, sm: 1 },
                    '&:hover': {
                      backgroundColor: 'rgba(254, 107, 139, 0.1)',
                      color: '#FE6B8B',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <EmojiEvents sx={{ fontSize: { xs: 20, sm: 24 } }} />
                </IconButton>
                <IconButton
                  onClick={handleDiscoverClick}
                  aria-label={t('title')}
                  size="small"
                  sx={{
                    color: 'text.primary',
                    transition: 'all 0.3s ease',
                    padding: { xs: 0.75, sm: 1 },
                    '&:hover': {
                      backgroundColor: 'rgba(254, 107, 139, 0.1)',
                      color: '#FE6B8B',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Explore sx={{ fontSize: { xs: 20, sm: 24 } }} />
                </IconButton>
              </>
            )}
            {user && canReceive && (
              <IconButton
                onClick={handleMessagesClick}
                aria-label="Messages"
                size="small"
                sx={{
                  position: 'relative',
                  color: 'text.primary',
                  transition: 'all 0.3s ease',
                  padding: { xs: 0.75, sm: 1 },
                  '&:hover': {
                    backgroundColor: 'rgba(254, 107, 139, 0.1)',
                    color: '#FE6B8B',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <NotificationBadge count={unreadCount} pulse={unreadCount > 0}>
                  <Inbox sx={{ fontSize: { xs: 20, sm: 24 } }} />
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
