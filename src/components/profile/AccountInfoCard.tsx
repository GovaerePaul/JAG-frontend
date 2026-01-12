'use client';

import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Person, Email, CalendarToday } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { User } from 'firebase/auth';
import { getUserEmail } from '@/lib/userUtils';
import InfoCard from '@/components/ui/InfoCard';

interface AccountInfoCardProps {
  user: User;
}

export default function AccountInfoCard({ user }: AccountInfoCardProps) {
  const t = useTranslations('profile');

  return (
    <InfoCard title={t('accountInformation')}>
      <List>
        <ListItem>
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          <ListItemText primary={t('displayName')} secondary={user.displayName || t('notSet')} />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Email />
          </ListItemIcon>
          <ListItemText primary={t('emailAddress')} secondary={getUserEmail(user)} />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <CalendarToday />
          </ListItemIcon>
          <ListItemText
            primary={t('memberSince')}
            secondary={
              user.metadata?.creationTime
                ? new Date(user.metadata.creationTime).toLocaleDateString()
                : t('unknown')
            }
          />
        </ListItem>
      </List>
    </InfoCard>
  );
}
