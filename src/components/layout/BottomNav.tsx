'use client';

import { BottomNavigation, BottomNavigationAction, Box } from '@mui/material';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import NotificationBadge from '@/components/NotificationBadge';
import { NAV_ITEMS } from '@/config/navigation';
import { DISPLAY_MOBILE_ONLY } from '@/theme/layoutConstants';
import { BOTTOM_NAV_HEIGHT } from '@/theme/layoutConstants';

interface BottomNavProps {
  unreadCount: number;
}

export default function BottomNav({ unreadCount }: BottomNavProps) {
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
            icon={
              item.showBadge ? (
                <NotificationBadge count={unreadCount} pulse={unreadCount > 0}>
                  <item.icon />
                </NotificationBadge>
              ) : (
                <item.icon />
              )
            }
            label={t(item.labelKey)}
          />
        ))}
      </BottomNavigation>
    </Box>
  );
}
