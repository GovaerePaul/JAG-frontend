'use client';

import { BottomNavigation, BottomNavigationAction, Box, Avatar } from '@mui/material';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import type { User } from 'firebase/auth';
import NotificationBadge from '@/components/NotificationBadge';
import { NAV_ITEMS } from '@/config/navigation';
import { DISPLAY_MOBILE_ONLY } from '@/theme/layoutConstants';
import { BOTTOM_NAV_HEIGHT } from '@/theme/layoutConstants';
import { getUserEmail } from '@/lib/userUtils';

interface BottomNavProps {
  unreadCount: number;
  user: User | null;
}

export default function BottomNav({ unreadCount, user }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();

  const getNavValue = (): string => {
    const path = typeof pathname === 'string' ? pathname : '';
    if (path.includes('/quests')) return 'quests';
    if (path.includes('/discover')) return 'discover';
    if (path.includes('/messages')) return 'messages';
    if (path.includes('/profile')) return 'profile';
    return 'home';
  };

  const renderIcon = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.id === 'profile' && user) {
      return (
        <Avatar
          src={user.photoURL || undefined}
          sx={{
            width: 24,
            height: 24,
            fontSize: '0.75rem',
          }}
        >
          {user.displayName
            ? user.displayName[0].toUpperCase()
            : getUserEmail(user)?.[0]?.toUpperCase() ?? '?'}
        </Avatar>
      );
    }
    if (item.showBadge) {
      return (
        <NotificationBadge count={unreadCount} pulse={unreadCount > 0}>
          <item.icon />
        </NotificationBadge>
      );
    }
    return <item.icon />;
  };

  return (
    <Box
      sx={{
        display: DISPLAY_MOBILE_ONLY,
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        borderTop: '1px solid rgba(254, 107, 139, 0.1)',
        boxShadow: '0 -2px 20px rgba(254, 107, 139, 0.08)',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <BottomNavigation
        value={getNavValue()}
        onChange={(_event, newValue) => {
          const item = NAV_ITEMS.find((i) => i.id === newValue);
          if (item) router.push(item.path);
        }}
        showLabels
        sx={{
          width: '100%',
          maxWidth: '100%',
          height: BOTTOM_NAV_HEIGHT,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 0,
            paddingTop: 1,
            flex: 1,
            maxWidth: 'none',
          },
        }}
      >
        {NAV_ITEMS.map((item) => (
          <BottomNavigationAction
            key={item.id}
            value={item.id}
            icon={renderIcon(item)}
            label={t(item.labelKey)}
          />
        ))}
      </BottomNavigation>
    </Box>
  );
}
