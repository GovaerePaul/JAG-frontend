'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import {
  Container,
  Paper,
  Box,
  Typography,
  Avatar,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Person,
  Email,
  CalendarToday,
  Security,
  Verified,
  Edit,
  Save,
  Cancel
} from '@mui/icons-material';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const { user } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedName, setEditedName] = useState(user?.displayName || '');

  if (!user) {
    return null;
  }

  const handleEditProfile = () => {
    setEditedName(user.displayName || '');
    setEditDialogOpen(true);
  };

  const handleSaveProfile = () => {
    // TODO: Implement profile update logic
    setEditDialogOpen(false);
  };

  const handleCancelEdit = () => {
    setEditedName(user.displayName || '');
    setEditDialogOpen(false);
  };

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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            src={user.photoURL || undefined}
            sx={{ 
              width: 100, 
              height: 100, 
              mr: 3,
              fontSize: '2rem'
            }}
          >
            {user.displayName?.charAt(0) || user.email?.charAt(0)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" gutterBottom>
              {user.displayName || t('noDisplayName')}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {user.email}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              {user.emailVerified && (
                <Chip 
                  icon={<Verified />} 
                  label={t('emailVerified')} 
                  color="success" 
                  size="small" 
                />
              )}
              <Chip 
                label={user.providerData[0]?.providerId || 'email'} 
                variant="outlined" 
                size="small" 
              />
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={handleEditProfile}
          >
            {t('editProfile')}
          </Button>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  {t('accountInformation')}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('displayName')}
                      secondary={user.displayName || t('notSet')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Email />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('emailAddress')}
                      secondary={user.email}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('memberSince')}
                      secondary={user.metadata?.creationTime ? 
                        new Date(user.metadata.creationTime).toLocaleDateString() : 
                        t('unknown')
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  {t('accountSecurity')}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Security />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('accountAgeLabel')}
                      secondary={getAccountAge()}
                    />
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
                    <ListItemText 
                      primary={t('lastSignIn')}
                      secondary={getLastSignIn()}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  {t('providerInformation')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {user.providerData.map((provider, index) => (
                    <Card key={index} variant="outlined" sx={{ p: 2, minWidth: 200 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('provider')} {index + 1}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>{t('providerId')}:</strong> {provider.providerId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>{t('uid')}:</strong> {provider.uid}
                      </Typography>
                      {provider.displayName && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>{t('displayName')}:</strong> {provider.displayName}
                        </Typography>
                      )}
                      {provider.email && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>{t('email')}:</strong> {provider.email}
                        </Typography>
                      )}
                    </Card>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Dialog open={editDialogOpen} onClose={handleCancelEdit} maxWidth="sm" fullWidth>
        <DialogTitle>{t('editProfile')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('displayName')}
            fullWidth
            variant="outlined"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit} startIcon={<Cancel />}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSaveProfile} variant="contained" startIcon={<Save />}>
            {t('save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
