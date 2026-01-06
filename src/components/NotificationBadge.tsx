'use client';

import { Badge, BadgeProps, Box } from '@mui/material';
import { keyframes } from '@mui/system';

// Pulse animation for the badge
const pulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(255, 0, 0, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
  }
`;

// Bounce animation for new notifications
const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
`;

interface NotificationBadgeProps extends Omit<BadgeProps, 'badgeContent'> {
  count: number;
  showZero?: boolean;
  animated?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
}

/**
 * Animated notification badge component
 * Shows a pulsing red badge with the count of unread items
 */
export default function NotificationBadge({
  count,
  showZero = false,
  animated = true,
  pulse: enablePulse = true,
  children,
  ...badgeProps
}: NotificationBadgeProps) {
  const hasNotifications = count > 0;

  return (
    <Badge
      badgeContent={count}
      color="error"
      max={99}
      showZero={showZero}
      sx={{
        '& .MuiBadge-badge': {
          ...(hasNotifications && animated && enablePulse && {
            animation: `${pulse} 2s ease-in-out infinite`,
          }),
          ...(hasNotifications && animated && !enablePulse && {
            animation: `${bounce} 0.5s ease-in-out`,
          }),
          fontSize: '0.75rem',
          fontWeight: 'bold',
          minWidth: '20px',
          height: '20px',
          padding: '0 6px',
        },
      }}
      {...badgeProps}
    >
      <Box
        sx={{
          ...(hasNotifications && animated && {
            animation: `${bounce} 0.5s ease-in-out`,
          }),
        }}
      >
        {children}
      </Box>
    </Badge>
  );
}

