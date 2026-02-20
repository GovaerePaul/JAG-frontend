'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import { Inbox, ArrowBack } from '@mui/icons-material';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { getCachedUserDisplayNames } from '@/lib/user-cache';
import type { MessageSummary } from '@/types/messages';
import { useReceivedMessages } from '@/features/messages/useReceivedMessages';
import { useEventTypes } from '@/features/events/useEventTypes';
import { formatDate } from '@/utils/date';
import { getStatusColor, getStatusLabel } from '@/utils/messages';
import MessageCard from './MessageCard';
import EmptyState from './EmptyState';
import EventTypeDisplay from './EventTypeDisplay';

export default function ReceivedMessagesPage() {
  const router = useRouter();
  const t = useTranslations('messages');
  const tCommon = useTranslations('common');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { messages: receivedMessages, loading, error } = useReceivedMessages();

  const getSenderIds = useCallback(
    (msgs: MessageSummary[]) =>
      msgs.filter((msg) => msg.senderId && !msg.isAnonymous).map((msg) => msg.senderId!),
    []
  );

  const [userNames, setUserNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadUserNames = async () => {
      const uniqueUserIds = [...new Set(getSenderIds(receivedMessages))];
      if (uniqueUserIds.length === 0) return;
      const namesMap = await getCachedUserDisplayNames(uniqueUserIds);
      setUserNames(namesMap);
    };

    if (receivedMessages.length > 0) {
      loadUserNames();
    }
  }, [receivedMessages, getSenderIds]);

  const messages = receivedMessages;
  const { eventTypes } = useEventTypes();

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button startIcon={<ArrowBack />} onClick={() => router.push('/')} sx={{ minWidth: 'auto' }}>
          {t('back')}
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          <Inbox sx={{ mr: 1, verticalAlign: 'middle' }} />
          {t('received.title')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {messages.length === 0 && !loading && (
        <EmptyState icon={<Inbox />} title={t('received.empty')} />
      )}

      {messages.length > 0 && (
        <>
          {isMobile ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {messages.map((message) => (
                <MessageCard
                  key={message.id}
                  message={message}
                  senderName={message.senderId ? userNames[message.senderId] : undefined}
                  onClick={() => router.push(`/messages/received?id=${message.id}`)}
                  eventTypes={eventTypes}
                />
              ))}
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={2}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('table.from')}</TableCell>
                    <TableCell>{t('table.eventType')}</TableCell>
                    <TableCell>{t('table.status')}</TableCell>
                    <TableCell>{t('table.date')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow
                      key={message.id}
                      hover
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                      onClick={() => router.push(`/messages/received?id=${message.id}`)}
                    >
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {message.isAnonymous
                              ? t('anonymousSender')
                              : message.senderId
                                ? userNames[message.senderId] || message.senderId
                                : tCommon('unknown')}
                          </Typography>
                          {message.isAnonymous && (
                            <Chip label={t('anonymous')} size="small" sx={{ mt: 0.5 }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <EventTypeDisplay
                          eventTypeId={message.eventTypeId}
                          eventTypes={eventTypes}
                          variant="body2"
                          iconSize="1.2rem"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(message.status, t)}
                          color={getStatusColor(message.status)}
                          size="small"
                        />
                        {message.isReported && (
                          <Chip label={t('reported')} color="error" size="small" sx={{ ml: 1 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(message.createdAt) || tCommon('unknown')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </Container>
  );
}
