'use client';

import { Card, CardContent, CardActions, Avatar, Typography, Button, Chip, Box } from '@mui/material';
import { Person, Send } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { DiscoveredUser } from '@/lib/users-api';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

interface UserCardProps {
  user: DiscoveredUser;
  onSendMessage?: (userId: string, userName?: string) => void;
}

export default function UserCard({ user, onSendMessage }: UserCardProps) {
  const t = useTranslations('discover');
  const router = useRouter();
  const locale = useLocale();
  const isNew = false; // TODO: Check if user is new based on createdAt

  const handleSendMessage = () => {
    if (onSendMessage) {
      onSendMessage(user.user.uid, user.user.displayName);
    } else {
      router.push(`/${locale}/messages/send?receiverId=${user.user.uid}`);
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 3 }}>
        <Box sx={{ position: 'relative', mb: 2 }}>
          <Avatar
            src={user.user.photoURL}
            sx={{ width: 80, height: 80 }}
          >
            <Person sx={{ fontSize: 40 }} />
          </Avatar>
          {isNew && (
            <Chip
              label={t('newUser')}
              color="primary"
              size="small"
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                fontSize: '0.7rem',
              }}
            />
          )}
        </Box>

        <Typography variant="h6" component="div" align="center" gutterBottom>
          {user.user.displayName || t('anonymous')}
        </Typography>

        {user.distance !== undefined && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t('distance', { distance: Math.round(user.distance) })}
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button
          variant="contained"
          startIcon={<Send />}
          onClick={handleSendMessage}
          fullWidth
          sx={{ mx: 2 }}
        >
          {t('sendMessage')}
        </Button>
      </CardActions>
    </Card>
  );
}

