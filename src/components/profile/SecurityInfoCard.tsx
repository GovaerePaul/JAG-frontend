'use client';

import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Security, Verified, CalendarToday } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { User } from 'firebase/auth';
import InfoCard from '@/components/ui/InfoCard';

interface SecurityInfoCardProps {
  user: User;
}

export default function SecurityInfoCard({ user }: SecurityInfoCardProps) {
  const t = useTranslations('profile');

  const getAccountAge = () => {
    if (!user.metadata?.creationTime) return t('unknown');
    const creationDate = new Date(user.metadata.creationTime);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - creationDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    }
  };

  const getLastSignIn = () => {
    if (!user.metadata?.lastSignInTime) return t('never');
    return new Date(user.metadata.lastSignInTime).toLocaleDateString();
  };

  return (
    <InfoCard title={t('accountSecurity')}>
      <List>
        <ListItem>
          <ListItemIcon>
            <Security />
          </ListItemIcon>
          <ListItemText primary={t('accountAgeLabel')} secondary={getAccountAge()} />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Verified />
          </ListItemIcon>
          <ListItemText
            primary={t('emailVerification')}
            secondary={user.emailVerified ? t('verified') : t('notVerified')}
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <CalendarToday />
          </ListItemIcon>
          <ListItemText primary={t('lastSignIn')} secondary={getLastSignIn()} />
        </ListItem>
      </List>
    </InfoCard>
  );
}
