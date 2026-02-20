'use client';

import { useState, useEffect } from 'react';
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
import { reportMessage } from '@/lib/messages-api';
import { useEventTypes } from '@/features/events/useEventTypes';
import { useMessage } from '@/features/messages/useMessage';
import { useAppDispatch } from '@/store/hooks';
import { markMessageAsRead as markMessageAsReadThunk } from '@/features/messages/messagesSlice';
import { formatDate } from '@/utils/date';
import { getStatusColor, getStatusLabel } from '@/utils/messages';
import EventTypeDisplay from './EventTypeDisplay';

export default function MessageDetailPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const messageId = searchParams?.get('id') || null;
  const t = useTranslations('messages');
  const tCommon = useTranslations('common');
  
  const isSentMessage = pathname?.includes('/messages/sent');
  const isReceivedMessage = pathname?.includes('/messages/received');
  
  const dispatch = useAppDispatch();
  const { message, senderName, receiverName, loading, error: messageError, refetch: refetchMessage } = useMessage(messageId);
  
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { eventTypes } = useEventTypes();

  useEffect(() => {
    if (message && isReceivedMessage && message.status !== 'read' && message.receiverId && messageId) {
      setMarkingAsRead(true);
      // Write to Firestore + update local Redux state (no refetch)
      dispatch(markMessageAsReadThunk(messageId))
        .catch(() => {})
        .finally(() => {
          setMarkingAsRead(false);
        });
    }
  }, [message, isReceivedMessage, messageId, dispatch]);

  const handleReport = async () => {
    if (!reportReason.trim() || !messageId) {
      return;
    }

    setReporting(true);
    try {
      const response = await reportMessage(messageId, reportReason.trim());
      if (response.success) {
        setReportDialogOpen(false);
        setReportReason('');
        await refetchMessage();
      } else {
        setError(response.error || t('error.failedToReport'));
      }
    } catch (_err) {
      setError(t('error.failedToReport'));
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

  const displayError = error || messageError;
  
  if (displayError && !message) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {displayError}
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

      {displayError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {displayError}
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
                    {message.isAnonymous ? t('anonymousSender') : (senderName || tCommon('unknown'))}
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
            <EventTypeDisplay
              eventTypeId={message.eventTypeId}
              eventTypes={eventTypes}
              variant="body1"
              iconSize="1.5rem"
            />
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

