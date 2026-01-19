'use client';

import { Box, Typography } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
import NotificationBadge from '@/components/NotificationBadge';

interface MessageStatCardProps {
  icon: React.ReactNode;
  count: number;
  label: string;
  unreadCount?: number;
  onClick?: () => void;
  color?: 'primary' | 'secondary';
  sx?: SxProps<Theme>;
}

export default function MessageStatCard({
  icon,
  count,
  label,
  unreadCount = 0,
  onClick,
  sx,
}: MessageStatCardProps) {
  const tHome = useTranslations('home');
  const isClickable = !!onClick;

  return (
    <Box
      sx={{
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: isClickable ? 'pointer' : 'default',
        p: 3,
        borderRadius: 3,
        transition: 'all 0.3s ease',
        background: 'linear-gradient(135deg, rgba(254, 107, 139, 0.05) 0%, rgba(255, 142, 83, 0.05) 100%)',
        '&:hover': isClickable
          ? {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(254, 107, 139, 0.2)',
              background: 'linear-gradient(135deg, rgba(254, 107, 139, 0.1) 0%, rgba(255, 142, 83, 0.1) 100%)',
            }
          : {},
        ...sx,
      }}
      onClick={onClick}
    >
      <NotificationBadge count={unreadCount} pulse={unreadCount > 0}>
        <Box
          sx={{
            fontSize: 40,
            mb: 1,
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {icon}
        </Box>
      </NotificationBadge>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {count}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
        {label}
      </Typography>
      {unreadCount > 0 && (
        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            color: '#FE6B8B',
            fontWeight: 'bold',
            fontSize: '0.75rem',
          }}
        >
          {unreadCount} {unreadCount === 1 ? tHome('userDashboard.newMessage') : tHome('userDashboard.newMessages')}
        </Typography>
      )}
    </Box>
  );
}
