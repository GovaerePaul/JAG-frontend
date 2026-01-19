'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import { Send, Close, Person, Explore } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useReceivedMessages } from '@/features/messages/useReceivedMessages';
import { useUserStats } from '@/features/user/useUserStats';
import { useEventTypes } from '@/features/events/useEventTypes';
import { sendMessage } from '@/lib/messages-api';
import type { SendMessageData } from '@/types/messages';
import { useReceivableUsers } from '@/features/user/useReceivableUsers';
import { useSentMessages } from '@/features/messages/useSentMessages';

interface SendMessageFormProps {
  open: boolean;
  onClose: () => void;
  receiverId?: string;
  receiverName?: string;
  onSuccess?: () => void;
}

export default function SendMessageForm({
  open,
  onClose,
  receiverId = '',
  receiverName = '',
  onSuccess,
}: SendMessageFormProps) {
  const { refetch: refetchReceivedMessages } = useReceivedMessages();
  const { refetch: refetchUserStats } = useUserStats();
  const { eventTypes, loading: eventsLoading } = useEventTypes();
  const { users: receivableUsers, loading: usersLoading } = useReceivableUsers();
  const { refetch: refetchSentMessages } = useSentMessages();
  const t = useTranslations('messages.send');
  const tCommon = useTranslations('common');
  const [formData, setFormData] = useState<SendMessageData>({
    receiverId: receiverId,
    eventTypeId: '',
    content: '',
    isAnonymous: false,
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Update formData.receiverId when receiverId prop changes
  useEffect(() => {
    if (receiverId) {
      setFormData((prev) => ({ ...prev, receiverId }));
    }
  }, [receiverId]);

  // Reset form when dialog closes (but not on success, as that's handled separately)
  useEffect(() => {
    if (!open && !success) {
      setFormData({
        receiverId: receiverId || '',
        eventTypeId: '',
        content: '',
        isAnonymous: false,
      });
      setError(null);
    }
  }, [open, success, receiverId]);

  const selectedEvent = eventTypes.find((e) => e.id === formData.eventTypeId);

  const handleSubmit = async () => {
    setError(null);

    if (!formData.receiverId) {
      setError(t('errors.receiverIdRequired'));
      return;
    }
    if (!formData.eventTypeId) {
      setError(t('errors.eventTypeRequired'));
      return;
    }
    if (!formData.content.trim()) {
      setError(t('errors.messageRequired'));
      return;
    }

    setSending(true);

    const response = await sendMessage(formData);

    if (response.success) {
      // Refetch data after successful message send
      await Promise.all([
        refetchReceivedMessages(),
        refetchSentMessages(),
        refetchUserStats(),
      ]);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          receiverId: '',
          eventTypeId: '',
          content: '',
          isAnonymous: false,
        });
        onSuccess?.();
        onClose();
      }, 1500);
    } else {
      setError(response.error || t('errors.failedToSend'));
    }

    setSending(false);
  };

  const handleClose = () => {
    if (!sending) {
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  // Group events by category
  const joyfulEvents = eventTypes.filter((e) => e.category === 'joyful');
  const sadEvents = eventTypes.filter((e) => e.category === 'sad');
  const neutralEvents = eventTypes.filter((e) => e.category === 'neutral');

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Send color="primary" />
          <Typography variant="h6">{t('title')}</Typography>
        </Box>
        <Button onClick={handleClose} disabled={sending} sx={{ minWidth: 'auto' }}>
          <Close />
        </Button>
      </DialogTitle>

      <DialogContent>
        {success ? (
          <Alert severity="success" sx={{ my: 2 }}>
            {t('success')}
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Receiver */}
            {receiverId ? (
              <TextField
                label={t('receiver')}
                value={receiverName || receiverId}
                disabled
                fullWidth
                helperText={t('sendingTo', {name: receiverName || receiverId})}
              />
            ) : (
              <Box>
                <FormControl fullWidth disabled={usersLoading || sending} sx={{ mb: 2 }}>
                  <InputLabel>{t('chooseRecipient')}</InputLabel>
                  <Select
                    value={formData.receiverId}
                    onChange={(e) => setFormData({ ...formData, receiverId: e.target.value })}
                    label={t('chooseRecipient')}
                    renderValue={(selected) => {
                      const user = receivableUsers.find((u) => u.uid === selected);
                      return user ? user.displayName || t('anonymousUser') : '';
                    }}
                  >
                    {usersLoading ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        {t('loadingUsers')}
                      </MenuItem>
                    ) : receivableUsers.length === 0 ? (
                      <MenuItem disabled>
                        {t('noUsersAvailable')}
                      </MenuItem>
                    ) : (
                      receivableUsers.map((user) => (
                        <MenuItem key={user.uid} value={user.uid}>
                          <ListItemAvatar>
                            <Avatar src={user.photoURL} sx={{ width: 32, height: 32 }}>
                              <Person />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={user.displayName || t('anonymousUser')}
                          />
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    onClose();
                    // Navigate to discover page
                    if (typeof window !== 'undefined') {
                      window.location.href = '/discover';
                    }
                  }}
                  startIcon={<Explore />}
                >
                  {t('discoverUsers')}
                </Button>
              </Box>
            )}

            {/* Event Type */}
            <FormControl fullWidth disabled={eventsLoading || sending}>
              <InputLabel>{t('occasion')}</InputLabel>
              <Select
                value={formData.eventTypeId}
                onChange={(e) => setFormData({ ...formData, eventTypeId: e.target.value })}
                label={t('occasion')}
              >
                {joyfulEvents.length > 0 && (
                  <MenuItem disabled>
                    <Typography variant="caption" color="text.secondary">
                      {t('joyfulEvents')}
                    </Typography>
                  </MenuItem>
                )}
                {joyfulEvents.map((event) => (
                  <MenuItem key={event.id} value={event.id}>
                    {event.icon} {event.name}
                  </MenuItem>
                ))}

                {sadEvents.length > 0 && (
                  <MenuItem disabled>
                    <Typography variant="caption" color="text.secondary">
                      {t('supportComfort')}
                    </Typography>
                  </MenuItem>
                )}
                {sadEvents.map((event) => (
                  <MenuItem key={event.id} value={event.id}>
                    {event.icon} {event.name}
                  </MenuItem>
                ))}

                {neutralEvents.length > 0 && (
                  <MenuItem disabled>
                    <Typography variant="caption" color="text.secondary">
                      {t('encouragement')}
                    </Typography>
                  </MenuItem>
                )}
                {neutralEvents.map((event) => (
                  <MenuItem key={event.id} value={event.id}>
                    {event.icon} {event.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedEvent && (
              <Chip
                icon={<span>{selectedEvent.icon}</span>}
                label={selectedEvent.description}
                variant="outlined"
                color="primary"
              />
            )}

            {/* Message Content */}
            <TextField
              label={t('yourMessage')}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder={t('messagePlaceholder')}
              multiline
              rows={4}
              disabled={sending}
              inputProps={{ maxLength: 2000 }}
              helperText={t('charactersCount', {count: formData.content.length})}
              fullWidth
            />

            {/* Anonymous */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isAnonymous}
                  onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                  disabled={sending}
                />
              }
              label={t('sendAnonymously')}
            />
          </Box>
        )}
      </DialogContent>

      {!success && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={sending}>
            {tCommon('cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={sending || !formData.receiverId || !formData.eventTypeId || !formData.content.trim()}
            startIcon={sending ? <CircularProgress size={20} /> : <Send />}
          >
            {sending ? t('sending') : t('sendButton')}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

