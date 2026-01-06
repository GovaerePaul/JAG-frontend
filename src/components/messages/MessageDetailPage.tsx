'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { ArrowBack, Flag } from '@mui/icons-material';
import { useRouter } from '@/i18n/navigation';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getMessage, markMessageAsRead, reportMessage, Message } from '@/lib/messages-api';
import { useEventTypes } from '@/hooks/useEventTypes';
import { formatDate } from '@/utils/date';
import { getStatusColor, getStatusLabel } from '@/utils/messages';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function MessageDetailPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const messageId = searchParams?.get('id') || '';
  const t = useTranslations('messages');
  const tCommon = useTranslations('common');
  
  // Detect if we're viewing a sent or received message
  const isSentMessage = pathname?.includes('/messages/sent');
  const isReceivedMessage = pathname?.includes('/messages/received');
  
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [senderName, setSenderName] = useState<string>('');
  const [receiverName, setReceiverName] = useState<string>('');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState(false);

  const { eventTypes } = useEventTypes();

  const getEventType = (eventTypeId: string) => {
    return eventTypes.find((et) => et.id === eventTypeId);
  };

  const getEventTypeName = (eventTypeId: string) => {
    const eventType = getEventType(eventTypeId);
    return eventType?.name || eventTypeId;
  };

  const loadMessage = useCallback(async () => {
    if (!messageId) {
      setError('Message ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getMessage(messageId);
      if (response.success && response.data) {
        const msg = response.data;
        setMessage(msg);

        // Load sender name if not anonymous (for received messages)
        if (msg.senderId && !msg.isAnonymous) {
          try {
            const userDoc = await getDoc(doc(db, 'users', msg.senderId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setSenderName(userData.displayName || userData.email || msg.senderId);
            } else {
              setSenderName(msg.senderId);
            }
          } catch (err) {
            console.error('Error fetching sender name:', err);
            setSenderName(msg.senderId);
          }
        } else {
          setSenderName(t('anonymousSender'));
        }

        // Load receiver name (for sent messages)
        if (msg.receiverId) {
          try {
            const userDoc = await getDoc(doc(db, 'users', msg.receiverId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setReceiverName(userData.displayName || userData.email || msg.receiverId);
            } else {
              setReceiverName(msg.receiverId);
            }
          } catch (err) {
            console.error('Error fetching receiver name:', err);
            setReceiverName(msg.receiverId);
          }
        }

        // Mark as read if not already read (only for received messages)
        if (isReceivedMessage && msg.status !== 'read' && msg.receiverId) {
          setMarkingAsRead(true);
          try {
            await markMessageAsRead(messageId);
            // Update local state
            setMessage({ ...msg, status: 'read' as const });
          } catch (err) {
            console.error('Error marking message as read:', err);
          } finally {
            setMarkingAsRead(false);
          }
        }
      } else {
        setError(response.error || t('error.loading'));
      }
    } catch (err) {
      setError('Failed to load message');
      console.error('Error fetching message:', err);
    } finally {
      setLoading(false);
    }
  }, [messageId, t, isReceivedMessage]);

  useEffect(() => {
    loadMessage();
  }, [loadMessage]);

  const handleReport = async () => {
    if (!reportReason.trim()) {
      return;
    }

    if (!messageId) {
      return;
    }

    setReporting(true);
    try {
      const response = await reportMessage(messageId, reportReason.trim());
      if (response.success) {
        setReportDialogOpen(false);
        setReportReason('');
        // Reload message to get updated status
        await loadMessage();
      } else {
        setError(response.error || 'Failed to report message');
      }
    } catch (err) {
      setError('Failed to report message');
      console.error('Error reporting message:', err);
    } finally {
      setReporting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const getBackPath = () => {
    if (isSentMessage) return '/messages/sent';
    return '/messages/received';
  };

  if (error && !message) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => router.push(getBackPath())}>
          {t('back')}
        </Button>
      </Container>
    );
  }

  if (!message) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          {t('error.messageNotFound')}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => router.push(getBackPath())}>
          {t('back')}
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push(getBackPath())}
          sx={{ minWidth: 'auto' }}
        >
          {t('back')}
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {t('detail.title')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {markingAsRead && isReceivedMessage && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {t('detail.markingAsRead')}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
            <Box>
              {isSentMessage ? (
                <>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('to')}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                    {receiverName || tCommon('unknown')}
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {message.isAnonymous ? t('anonymous') : t('from')}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                    {senderName || tCommon('unknown')}
                  </Typography>
                </>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Chip
                label={getStatusLabel(message.status, t)}
                color={getStatusColor(message.status)}
                size="small"
              />
              {message.isReported && (
                <Chip label={t('reported')} color="error" size="small" />
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('table.eventType')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getEventType(message.eventTypeId)?.icon && (
                <Typography variant="body1" component="span" sx={{ fontSize: '1.5rem' }}>
                  {getEventType(message.eventTypeId)?.icon}
                </Typography>
              )}
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {getEventTypeName(message.eventTypeId)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('detail.date')}
            </Typography>
            <Typography variant="body2">
              {formatDate(message.createdAt) || tCommon('unknown')}
            </Typography>
          </Box>

          {message.readAt && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('detail.readAt')}
              </Typography>
              <Typography variant="body2">
                {formatDate(message.readAt) || tCommon('unknown')}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('detail.content')}
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
              {message.content}
            </Typography>
          </Box>

          {!message.isReported && isReceivedMessage && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Flag />}
                onClick={() => setReportDialogOpen(true)}
              >
                {t('detail.report')}
              </Button>
            </Box>
          )}

          {message.isReported && message.reportReason && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('detail.reportedReason')}
              </Typography>
              <Typography variant="body2">
                {message.reportReason}
              </Typography>
            </Alert>
          )}
        </Box>
      </Paper>

      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('detail.reportDialog.title')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('detail.reportDialog.description')}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label={t('detail.reportDialog.reasonLabel')}
            fullWidth
            multiline
            rows={4}
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)} disabled={reporting}>
            {tCommon('cancel')}
          </Button>
          <Button
            onClick={handleReport}
            variant="contained"
            color="error"
            disabled={!reportReason.trim() || reporting}
          >
            {reporting ? tCommon('loading') : t('detail.reportDialog.submit')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

